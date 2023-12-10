import { GameData } from "../types/GameDataType";

type AuthResultType = {
    authenticated: boolean,
    isCreator: boolean,
}

export const authenticateUser = (game: GameData, token: string): AuthResultType => {
    if (game == null) return { authenticated: false, isCreator: false };

    for (const pl of game.players) {
        if (pl.token === token) {
            return {
                authenticated: true,
                isCreator: pl.creator,
            };
        }
    }
    return { authenticated: false, isCreator: false };
};