import { randomBytes } from "crypto";
import { Card } from "../types/CardType";
import { GameData } from "./gameData";
import { Hand } from "./hand";
import { addPlayerToGameInDB } from "./gameDataManager";

export type Player = {
    token: string,
    identifier: string,
    username: string,
    tablePosition: number,
    creator: boolean,
    stack: number,

    roundBet?: number,
    insurance?: number,
    cards?: Card[][],
    hands: Hand[],
    participates?: boolean;
    isThisPlayersTurn?: boolean,
};

export const addPlayerToGame = async (game: GameData, userToken: string, username: string) => {
    if (game.players.find(elem => elem.token == userToken)) {
        return;
    }

    let newUser = {
        token: userToken,
        username: username,
        tablePosition: game.players.length + 1,
        creator: false,
        stack: game.settings.startingStack,
        hands: [],
        identifier: randomBytes(10).toString("base64url"),
    };

    addPlayer(game, newUser);
    await addPlayerToGameInDB(game, newUser);
};

export const getPlayer = (game: GameData, token: string): Player => {
    for (const pl of game.players) {
        if (pl.token === token) {
            return pl;
        }
    }
    return null;
}

export const getPlayerByIdentifier = (game: GameData, identifier: string): Player => {
    for (const pl of game.players) {
        if (pl.identifier === identifier) {
            return pl;
        }
    }
    return null;
}

export const getPlayerFromParticipants = (game: GameData, token: string): Player => {
    for (const pl of game.currentRound.participants) {
        if (pl.token === token) {
            return pl;
        }
    }
    return null;
}

export const kickPlayer = (game: GameData, player: Player) => {
    game.players.splice(game.players.indexOf(player));
};

export const addPlayer = (game: GameData, player: Player) => {
    game.players.push(player);
};

export const getParticipants = (game: GameData): Player[] => {
    return game.currentRound.participants;
}

const handsToObjects = (player: Player) => {
    let obj = [];
    for (const i of player.hands) {
        obj.push(i.toObject());
    }
    return obj;
}

export const getSafePlayersData = (game: GameData) => {
    let result = [];
    for (const pl of game.players) {
        result.push({
            identifier: pl.identifier,
            username: pl.username,
            tablePosition: pl.tablePosition,
            stack: pl.stack,
            hands: handsToObjects(pl),
            roundBet: pl.roundBet,
            participates: pl.participates,
            creator: pl.creator,
            insurance: pl.insurance,
        });
    }
    return result;
}