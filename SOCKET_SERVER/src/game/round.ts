import { sendPlayerDataUpdate } from "../lib/auth";
import { delay } from "../util/util";
import { cardsLeftInShoe, dealToParticipants, drawCard, generateRandomShoe } from "./cards";
import { GameData } from "./gameData";
import { updateGameStartedInDB } from "./gameDataManager";
import { Hand, calculateActionsForHands } from "./hand";
import { Player, getParticipants } from "./players";

type EmitEventFunction = (roomId: string | string[], event: string, data: any) => void;

export const resetStateBeforeNextRound = (game: GameData) => {
    game.currentRound = {
        participants: [],
        cardsLeftBefore: cardsLeftInShoe(game),
        cardsLeftAfter: cardsLeftInShoe(game),
        currentPlayerIndex: undefined,
        currentPlayerHandIndex: undefined,
    };

    game.dealerCards = new Hand(-1);
    game.betsClosedTimeout = null;
    game.dealerCardsSum = 0;

    game.players.forEach((pl) => {
        pl.hands = [];
        pl.cards = undefined;
        pl.roundBet = undefined;
        pl.participates = undefined;
        pl.isThisPlayersTurn = false;
    });
}

export const addParticipantInCurrentRound = (game: GameData, player: Player) => {
    game.currentRound.participants.push(player);
    player.participates = true;
};

export const sortParticipantsByTablePosition = (game: GameData) => {
    if (game.currentRound.participants.length == 0) return;

    game.currentRound.participants.sort((a, b) => a.tablePosition - b.tablePosition);
};

export const possiblePlayerHandActions = (game: GameData, player: Player, handIdx: number): string[] => {
    let hand = player.hands[handIdx];

    if (hand.handValue()[0] >= 21 || hand.isBlackjackHand()) return [];

    if (!hand.playerHasDoubled) {
        let result = ["hit", "stand"];
        if (player.stack >= hand.bet && hand.canSplit()) result.push("split");
        if (hand.canDouble(player.stack)) result.push("double")

        return result;
    }

    return [];
};

const min = (array: number[]): number => {
    let min = array[0];
    for (const i of array) {
        if (i < min) min = i;
    }
    return min;
};

const max = (array: number[]): number => {
    let max = array[0];
    for (const i of array) {
        if (i > max) max = i;
    }
    return max;
};

const higestBelow = (array: number[], maxValue: number): number => {
    array = array.sort();
    let below = array.filter(x => x <= maxValue);
    if (below.length > 0) return max(below);
    return min(array);
};

export const handleDealerCardDrawingAndNextRound = async (game: GameData, emitEvent: EmitEventFunction) => {
    game.currentRound.currentPlayerIndex = undefined;
    sendPlayerDataUpdate(game, emitEvent);

    let dealerHand = game.dealerCards;
    // uncover dealer second card
    for (const card of dealerHand.cards) card.isBack = false;

    let x = higestBelow(dealerHand.handValue(), 21);
    game.dealerCardsSum = x;

    await delay(1000);
    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());

    while (x <= 16) {
        await delay(1000);
        dealerHand.cards.push(drawCard(game));

        x = higestBelow(dealerHand.handValue(), 21);
        game.dealerCardsSum = x;
        emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    }

    // TODO Check for chips won/lost
    for (const player of game.currentRound.participants) {
        for (const hand of player.hands) {
            if (hand.winAmount == null) {
                let handValue = higestBelow(hand.handValue(), 21);
                if (x > 21) {
                    hand.winAmount = hand.bet;
                } else if (handValue < x) {
                    hand.winAmount = -hand.bet;
                } else if (handValue == x) {
                    hand.winAmount = 0;
                } else {
                    hand.winAmount = hand.bet;
                }
            }
            player.stack += hand.bet + hand.winAmount;
        }
    }

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    await delay(2000);

    if (game.shoe.length < 50) {
        generateRandomShoe(game, 6);
    }

    resetStateBeforeNextRound(game);

    if (game.pauseRequested) {
        game.gameStarted = false;
        game.pauseRequested = false;

        emitEvent(game.socketRoomId, "game_paused", {});
        await updateGameStartedInDB(game);
        return;
    }

    sendPlayerDataUpdate(game, emitEvent);
    setTimeout(() => {
        emitEvent(game.socketRoomId, "hand_starting", game.gameUpdateData());

        game.bettingTime = true;
        sendPlayerDataUpdate(game, emitEvent);
    }, 2_000);
};

export const startRound = (game: GameData, emitEvent: EmitEventFunction) => {
    game.dealerCards = new Hand(-1);
    game.players.forEach((pl) => {
        if (pl.participates !== true) {
            pl.participates = false;
        }
    });

    sortParticipantsByTablePosition(game);

    let participants = getParticipants(game);
    dealToParticipants(game);
    calculateActionsForHands(game);

    participants[0].isThisPlayersTurn = true;
    game.currentRound.currentPlayerIndex = 0;
    game.currentRound.currentPlayerHandIndex = 0;

    nextPlayerOrHandTurn(game, "self_call", emitEvent);

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
};

export const nextPlayerOrHandTurn = (game: GameData, lastAction: any, emitEvent: EmitEventFunction) => {
    let currentPlayer = game.currentRound.participants[game.currentRound.currentPlayerIndex];
    let currentHand = currentPlayer.hands[game.currentRound.currentPlayerHandIndex];
    let possibleActions = currentHand.possibleActions;

    // function called to check if player/hand has possible actions, if yes then send data update and wait for next action player takes
    if (lastAction == "self_call" && possibleActions.length > 0) {
        sendPlayerDataUpdate(game, emitEvent);
        return;
    }

    // player didn't stand and has more actions on this hand, allow him to take another action
    if (lastAction != "stand" && possibleActions.length > 0) {
        sendPlayerDataUpdate(game, emitEvent);
        return;
    }

    // player has more hands to play with, switch to the next one and check for it's actions
    if (game.currentRound.currentPlayerHandIndex < currentPlayer.hands.length - 1) {
        game.currentRound.currentPlayerHandIndex++;

        nextPlayerOrHandTurn(game, "self_call", emitEvent);
        return;
    }

    // there is another player after current one, switch to him and check
    if (game.currentRound.currentPlayerIndex < game.currentRound.participants.length - 1) {
        game.currentRound.currentPlayerIndex++;
        game.currentRound.currentPlayerHandIndex = 0;

        nextPlayerOrHandTurn(game, "self_call", emitEvent);
        return;
    }

    // if none of the above conditions are true, that means the round doesn't have more possible actions
    // show dealers cards, and prepare next round
    handleDealerCardDrawingAndNextRound(game, emitEvent);
};

export const respondToPlayerAction = async (game: GameData, data: any, emitEvent: EmitEventFunction) => {
    let currentPlayer = game.currentRound.participants[game.currentRound.currentPlayerIndex];
    let possibleActions = possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex ?? 0);
    let currentHand = currentPlayer.hands[game.currentRound.currentPlayerHandIndex];

    // disregard invalid requests
    if (game.currentRound.currentPlayerIndex == undefined) return;
    if (currentPlayer.token !== data.auth.token) return;
    if (!possibleActions.includes(data.action)) return;

    // handle action that user takes
    if (data.action == "hit") {
        currentHand.cards.push(drawCard(game));
    } else if (data.action == "split") {
        currentPlayer.hands.push(currentHand.split());

        currentHand.cards.push(drawCard(game));
        currentPlayer.hands[currentPlayer.hands.length - 1].cards.push(drawCard(game));

        // get new possible action for new hands
        currentHand.possibleActions = possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex);
        currentPlayer.hands[currentPlayer.hands.length - 1].possibleActions = possiblePlayerHandActions(game, currentPlayer, currentPlayer.hands.length - 1);
    } else if (data.action == "double") {
        currentPlayer.stack -= currentHand.bet;
        currentHand.bet *= 2;
        currentHand.playerHasDoubled = true;

        currentHand.cards.push(drawCard(game));
    }

    if (currentHand.isBlackjackHand()) {
        currentHand.winAmount = currentHand.bet * (3 / 2);
    } else if (currentHand.handValue()[0] > 21) {
        currentHand.winAmount = -currentHand.bet;
    }

    // emit new game state and recalculate player actions
    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    currentHand.possibleActions = possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex);

    // 
    nextPlayerOrHandTurn(game, data.action, emitEvent);
};