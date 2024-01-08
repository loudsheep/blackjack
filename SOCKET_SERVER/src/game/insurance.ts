import { sendPlayerDataUpdate } from "../lib/auth";
import { GameData } from "./gameData";
import { Player, getPlayerFromParticipants } from "./players";

export const setTimeoutForInsurance = (game: GameData, callback: () => void, delay: number, timeoutSetCallback?: () => void) => {
    if (game.insuranceTimeout) return;

    game.insuranceTimeout = setTimeout(callback, delay);
    game.insuranceTimeoutStartTime = Date.now();
    if (timeoutSetCallback != undefined) {
        timeoutSetCallback();
    }
};

export const timeLeftForInsurance = (game: GameData) => {
    if (game.insuranceTimeout) {
        let x = Date.now() - game.insuranceTimeoutStartTime;
        x = game.insuranceTimeout._idleTimeout - x;

        return x;
    }
    return null;
};

export const playerCanInsureBet = (game: GameData, player: Player): boolean => {
    if (!getPlayerFromParticipants(game, player.token)) return false;

    // assuming that insurance is open and closed before any splitting cards
    if (player.hands[0].winAmount) return false;

    return !player.insurance && (player.stack >= player.roundBet / 2);
};

export const payInsuredPlayers = (game: GameData) => {
    for (const player of game.currentRound.participants) {
        if (player.insurance > 0) {
            player.stack += player.insurance;
            player.hands[0].winAmount = 0;
        }
    }
};

export const collectInsurance = (game: GameData) => {
    for (const player of game.currentRound.participants) {
        player.insurance = undefined;
    }
};