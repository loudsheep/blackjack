import { GameData, Player } from "../models/gameData";

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

export const getUserByToken = (game: GameData, token: string) => {
    if (game == null) return null;

    for (const pl of game.players) {
        if (pl.token === token) {
            return pl;
        }
    }

    return null;
};