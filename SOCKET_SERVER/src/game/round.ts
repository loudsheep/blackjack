import { cardsLeftInShoe, dealToParticipants, drawCard } from "./cards";
import { GameData } from "./gameData";
import { Hand } from "./hand";
import { Player, getParticipants } from "./players";

type EmitEventFunction = (roomId: string | string[], event: string, data: any) => void;

export const resetStateBeforeNextRound = (game: GameData) => {
    game.currentRound = {
        participants: [],
        cardsLeftBefore: cardsLeftInShoe(game),
        cardsLeftAfter: cardsLeftInShoe(game),
        currentPlayerIndex: undefined,
    };

    game.players.forEach((pl) => {
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

export const startRound = (game: GameData, emitEvent: EmitEventFunction) => {
    game.dealerCards = [];
    game.players.forEach((pl) => {
        if (pl.participates !== true) {
            pl.participates = false;
        }
    });

    sortParticipantsByTablePosition(game);

    let participants = getParticipants(game);
    dealToParticipants(game);

    participants[0].isThisPlayersTurn = true;
    game.currentRound.currentPlayerIndex = 0;
    game.currentRound.currentPlayerHandIndex = 0;

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
    // TODO get player actions based on hand
    emitEvent(participants[0].token, "my_turn", { type: "cardAction", actions: ["hit", "stand", "double", "split"], hand: 0, time: 10000 });
};

export const respondToPlayerAction = async (game: GameData, data: any, emitEvent: EmitEventFunction) => {
    if (game.currentRound.currentPlayerIndex == undefined) return;

    let currentPlayer = game.currentRound.participants[game.currentRound.currentPlayerIndex];
    if (currentPlayer.token !== data.auth.token) return;

    let possibleActions = ["hit", "stand", "double", "split"];
    if (!possibleActions.includes(data.action)) return;

    if (data.action == "hit") {
        currentPlayer.hands[game.currentRound.currentPlayerHandIndex].cards.push(drawCard(game));
    } else if (data.action == "split") {
        currentPlayer.hands.push(currentPlayer.hands[game.currentRound.currentPlayerHandIndex].split())
        ;
        currentPlayer.hands[game.currentRound.currentPlayerHandIndex].cards.push(drawCard(game));
        currentPlayer.hands[currentPlayer.hands.length - 1].cards.push(drawCard(game));
    } else if (data.action == "double") {
        currentPlayer.stack -= currentPlayer.hands[game.currentRound.currentPlayerHandIndex].bet;
        currentPlayer.hands[game.currentRound.currentPlayerHandIndex].bet *= 2;
        currentPlayer.hands[game.currentRound.currentPlayerHandIndex].playerHasDoubled = true;
    }

    emitEvent(game.socketRoomId, "game_update", game.gameUpdateData());
};