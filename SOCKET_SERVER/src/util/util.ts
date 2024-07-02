import { GameData } from "../game/gameData";

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const cleanInactiveGames = (games: GameData[]) => {
    for (let i = games.length - 1; i >= 0; i--) {
        const game = games[i];
        // 5 hours
        if (Date.now() - game.lastActive > 1000 * 60 * 60 * 5) {
            games.splice(i, 1);
        }
    }
    return games;
};