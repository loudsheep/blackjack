import { GameData } from "./gameData"
import { getPlayer } from "./players";
import { addParticipantInCurrentRound } from "./round";

export const placeBet = (game: GameData, amount: number, token: string): boolean => {
    let player = getPlayer(game, token);

    if (!player) return false;

    if (player.roundBet != undefined) return false;
    if (player.stack < game.settings.minBet) return false;

    amount = Math.min(amount, game.settings.maxBet);

    player.cards = [];
    player.roundBet = amount;
    player.stack -= amount;

    addParticipantInCurrentRound(game, player);

    return true;
};

export const setTimeoutForBetting = (game: GameData, callback: () => void, delay: number, timeoutSetCallback?: () => void) => {
    if (game.betsClosedTimeout) return;

    game.betsClosedTimeout = setTimeout(callback, delay);
    if (timeoutSetCallback != undefined) {
        timeoutSetCallback();
    }
};