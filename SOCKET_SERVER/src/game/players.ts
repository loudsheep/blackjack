import { Card } from "../types/CardType";
import { GameData } from "./gameData";

export type Player = {
    token: string,
    identifier: string,
    username: string,
    tablePosition: number,
    creator: boolean,
    stack: number,

    roundBet?: number,
    cards?: Card[][],
    participates?: boolean;
    isThisPlayersTurn?: boolean,
};

export const getPlayer = (game: GameData, token: string): Player => {
    for (const pl of game.players) {
        if (pl.token === token) {
            return pl;
        }
    }
    return null;
}

export const addPlayer = (game: GameData, player: Player) => {
    game.players.push(player);
};

export const getParticipants = (game: GameData): Player[] => {
    return game.players.filter(x => x.participates === true);
}

export const getSafePlayersData = (game: GameData) => {
    let result = [];
    for (const pl of game.players) {
        result.push({
            identifier: pl.identifier,
            username: pl.username,
            tablePosition: pl.tablePosition,
            stack: pl.stack,
            cards: pl.cards,
            roundBet: pl.roundBet,
            participates: pl.participates,
        });
    }
    return result;
}