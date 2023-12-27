import { GameData } from "../game/gameData";
import { Player } from "../game/players";

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
        socketEmit(player.token, "player_update", player);
        if (game.gameStarted && game.currentRound.currentPlayerIndex != undefined && game.currentRound.participants[game.currentRound.currentPlayerIndex].token == player.token) {
            // TODO 
            socketEmit(player.token, 'my_turn', { type: "cardAction", actions: ["hit", "stand", "double", "split"], hand: 0, time: 10000 });
        }
    }
}