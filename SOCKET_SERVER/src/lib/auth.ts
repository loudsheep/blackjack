import { timeLeftForBetting } from "../game/bets";
import { GameData } from "../game/gameData";
import { Player } from "../game/players";
import { possiblePlayerHandActions } from "../game/round";

type AuthResultType = {
    authenticated: boolean,
    isCreator: boolean,
    playerData?: Player;
}

export const authenticateUser = (game: GameData, token: string): AuthResultType => {
    if (game == null) return { authenticated: false, isCreator: false };

    for (const pl of game.players) {
        if (pl.token === token) {
            return {
                authenticated: true,
                isCreator: pl.creator,
                playerData: pl,
            };
        }
    }
    return { authenticated: false, isCreator: false };
};

export const sendPlayerDataUpdate = (game: GameData, socketEmit: (roomId: string, event: string, data: any) => any) => {
    for (const player of game.players) {
        // send player info like token, tablePosition, etc.
        socketEmit(player.token, "player_update", player);
        socketEmit(player.token, 'my_turn_finished', {});

        if (!game.gameStarted) continue;
        if (!game.currentRound) continue;
        // if (game.currentRound.participants[game.currentRound.currentPlayerIndex]?.token != player.token) continue;

        if (game.bettingTime && player.roundBet == undefined) {
            // if (game.betsClosedTimeout != null) {
                socketEmit(player.token, 'my_turn', { type: "bet", time: timeLeftForBetting(game) });
            // } else {
                // socketEmit(player.token, 'my_turn', { type: "bet", time: null });
            // }
            continue;
        }
        
        if (game.currentRound.currentPlayerIndex == undefined) continue;

        if (game.currentRound.participants[game.currentRound.currentPlayerIndex]?.token == player.token) {
            socketEmit(player.token, 'my_turn', { type: "cardAction", actions: possiblePlayerHandActions(game, player, game.currentRound.currentPlayerHandIndex), hand: game.currentRound.cardsLeftAfter, time: 10000 });
        } 
        // else {
        //     socketEmit(player.token, 'my_turn_finished', {});
        // }

        // if (game.betsClosedTimeout != null) {
        // }

        // // let user know what it is supposed to do now
        // if (game.gameStarted && game.currentRound.currentPlayerIndex != undefined
        //     && game.currentRound.participants[game.currentRound.currentPlayerIndex]?.token == player.token) {
        //     // TODO 
        //     socketEmit(player.token, 'my_turn', { type: "cardAction", actions: possiblePlayerHandActions(game, player, game.currentRound.currentPlayerHandIndex), hand: game.currentRound.cardsLeftAfter, time: 10000 });
        // } else {
        //     socketEmit(player.token, 'my_turn_finished', {});
        // }
    }
}