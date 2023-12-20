import { cardsLeftInShoe } from "./cards";
import { GameData } from "./gameData";
import { Player } from "./players";

export const resetStateBeforeNextRound = (game: GameData) => {
    game.currentRound = {
        participants: [],
        cardsLeftBefore: cardsLeftInShoe(game),
        cardsLeftAfter: cardsLeftInShoe(game),
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

export const startRound = (game: GameData) => {
    game.dealerCards = [];
    game.players.forEach((pl) => {
        if (pl.participates !== true) {
            pl.participates = false;
        }
    });
};