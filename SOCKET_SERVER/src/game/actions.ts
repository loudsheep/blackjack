import { GameData } from "./gameData";

export const clearPlayerActionTimeout = (game: GameData) => {
    if (game.playerActionTimeout == null) return;

    clearTimeout(game.playerActionTimeout);
    game.playerActionTimeout = null;
    game.playerActionTimeoutStartTime = null;
};

export const setTimeoutForAction = (game: GameData, callback: () => void, delay: number, timeoutSetCallback?: () => void) => {
    if (game.playerActionTimeout) return;

    game.playerActionTimeout = setTimeout(callback, delay);
    game.playerActionTimeoutStartTime = Date.now();
    if (timeoutSetCallback != undefined) {
        timeoutSetCallback();
    }
};

export const timeLeftForAction = (game: GameData) => {
    if (game.playerActionTimeout) {
        let x = Date.now() - game.playerActionTimeoutStartTime;
        x = game.playerActionTimeout._idleTimeout - x;

        return x;
    }
    return null;
};