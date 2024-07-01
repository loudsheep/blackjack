
import { EmitEventFunction } from "../types/types";
import { GameData } from "./gameData";
import { Player } from "./players";

// emit ping event
export const standardPingCallout = (game: GameData, emitEvent: EmitEventFunction) => {
    let t = Date.now();

    for (const player of game.players) {
        if (player.ping.respondedToLastPing == false) {
            player.ping.connected = false;
            player.ping.missedPings = player.ping.missedPings != undefined ? player.ping.missedPings + 1 : 0;
        }

        player.ping.lastPingTime = t;
    }

    emitEvent(game.socketRoomId, "ping", {});
};

export const handlePong = (player: Player) => {
    if (!player.ping.lastPingTime) player.ping.lastPingTime = Date.now();

    let x = Date.now() - player.ping.lastPingTime;

    if (x == 0) return;

    player.ping = {
        connected: true,
        pingMS: x,
        respondedToLastPing: true,
        missedPings: 0,
    };
};

// TODO: when no active players are in the game, remove from active games
export const handleEmptyGame = (game: GameData, allGames: GameData[]) => { };