import { sendPlayerDataUpdate } from "../lib/auth";
import { delay } from "../util/util";
import { cardsLeftInShoe, dealToParticipants, drawCard } from "./cards";
import { GameData } from "./gameData";
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

const higestBelow = (array: number[], max: number): number => {
    let below = array.filter(x => x <= max);

    if (below.length > 0) return below[below.length - 1];

    return array[0];
};

export const handleDealerCardDrawingAndNextRound = async (game: GameData, emitEvent: EmitEventFunction) => {
    game.currentRound.currentPlayerIndex = undefined;
    sendPlayerDataUpdate(game, emitEvent);

    let dealerHand = game.dealerCards;
    // uncover dealer second card
    for (const card of dealerHand.cards) card.isBack = false;

    await delay(1000);
    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    
    while (higestBelow(dealerHand.handValue(), 21) <= 16) {
        await delay(1000);
        dealerHand.cards.push(drawCard(game));
        emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    }

    await delay(2000);

    // TODO Check for chips won/lost

    resetStateBeforeNextRound(game);
    sendPlayerDataUpdate(game, emitEvent);

    setTimeout(() => emitEvent(game.socketRoomId, "hand_starting", game.gameUpdateData()), 2_000);
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

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    sendPlayerDataUpdate(game, emitEvent);
};

export const nextPlayerOrHandTurn = (game: GameData, lastAction: any, emitEvent: EmitEventFunction) => {
    let currentPlayer = game.currentRound.participants[game.currentRound.currentPlayerIndex];
    let currentHand = currentPlayer.hands[game.currentRound.currentPlayerHandIndex];
    let possibleActions = currentHand.possibleActions;

    // function called to check if player/hand has possible actions, idf yes then send data update and wait for next action player takes
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

        nextPlayerOrHandTurn(game, "self_call", emitEvent);
        return;
    }

    // if none of the above conditions are true, that means the round doesn't have more possible actions
    // show dealers cards, and prepare next round
    handleDealerCardDrawingAndNextRound(game, emitEvent);
};

export const respondToPlayerAction = async (game: GameData, data: any, emitEvent: EmitEventFunction) => {
    if (game.currentRound.currentPlayerIndex == undefined) return;

    let currentPlayer = game.currentRound.participants[game.currentRound.currentPlayerIndex];
    if (currentPlayer.token !== data.auth.token) return;

    let possibleActions = possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex ?? 0);
    if (!possibleActions.includes(data.action)) return;

    let currentHand = currentPlayer.hands[game.currentRound.currentPlayerHandIndex];

    if (data.action == "hit") {

        currentHand.cards.push(drawCard(game));

    } else if (data.action == "split") {

        currentPlayer.hands.push(currentHand.split());
        currentHand.cards.push(drawCard(game));

        currentPlayer.hands[currentPlayer.hands.length - 1].cards.push(drawCard(game));

    } else if (data.action == "double") {

        currentPlayer.stack -= currentHand.bet;
        currentHand.bet *= 2;
        currentHand.playerHasDoubled = true;

        currentHand.cards.push(drawCard(game));

    }

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    currentHand.possibleActions = possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex);

    // if (data.action != "stand" && possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex).length > 0) {
    //     // console.log("SAME HAND", game.currentRound.currentPlayerHandIndex);

    //     sendPlayerDataUpdate(game, emitEvent);
    //     return;
    // }

    // if (game.currentRound.currentPlayerHandIndex < currentPlayer.hands.length - 1) {
    //     // console.log("NEXT HAND", game.currentRound.currentPlayerHandIndex + 1);
    //     game.currentRound.currentPlayerHandIndex++;

    //     if (possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex).length > 0) {
    //         sendPlayerDataUpdate(game, emitEvent);
    //         return;
    //     }
    // }

    // if (game.currentRound.currentPlayerIndex < game.currentRound.participants.length - 1) {
    //     // console.log("NEXT PLAYER", game.currentRound.currentPlayerIndex + 1);

    //     game.currentRound.currentPlayerIndex++;
    //     game.currentRound.currentPlayerHandIndex = 0;

    //     if (possiblePlayerHandActions(game, currentPlayer, game.currentRound.currentPlayerHandIndex).length > 0) {
    //         sendPlayerDataUpdate(game, emitEvent);
    //         return;
    //     }
    // }

    nextPlayerOrHandTurn(game, data.action, emitEvent);

    // console.log("NEXT ROUND");

    // all players have taken action, deal cards to dealer and then prepare next round
    // handleDealerCardDrawingAndNextRound(game, emitEvent);
};