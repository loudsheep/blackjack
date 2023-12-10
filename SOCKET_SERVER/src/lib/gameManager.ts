import { randomBytes } from "crypto";
import Game from "../models/game";
import { GameData } from "../types/GameDataType"
import connectMongoDB from "./mongodb";

export const createGamesObject = () => {
    let games: GameData[] = [];
    return games;
}

export const getGameData = async (games: GameData[], gameHash: string): Promise<boolean> => {
    if (games.find(elem => elem.hash == gameHash)) {
        return;
    }

    await connectMongoDB();

    let game = await Game.findOne({ hash: gameHash }).exec();
    if (!game || !game.active) {
        return false;
    }

    let players = [];
    for (const i of game.players) {
        players.push({
            token: i.token,
            username: i.username,
            tablePosition: i.tablePosition,
            stack: game.settings.startingStack,
            creator: i.creator,
        });
    }

    games.push({
        socketRoomId: game.socketRoomId,
        gameStarted: false,
        hash: gameHash,
        active: game.active,
        players: players,
        settings: {
            startingStack: game.settings.startingStack,
            minBet: game.settings.minBet,
            maxBet: game.settings.maxBet,
        },
    });

    return true;
}

export const getGameByRoomId = (games: GameData[], roomId: string): GameData | null => {
    for (const i of games) {
        if (i.socketRoomId === roomId) {
            return i;
        }
    }
    return null;
};

export const addPlayerToGame = (game: GameData, userToken: string, username: string): void => {
    if (game.players.find(elem => elem.token == userToken)) {
        return;
    }

    let newUser = {
        token: userToken,
        username: username,
        tablePosition: game.players.length + 1,
        creator: false,
        stack: game.settings.startingStack,
        identifier: randomBytes(10).toString("base64url"),
    };

    game.players.push(newUser);
    console.log("New player added to game: ", userToken, username);
};

export const updateGameStartedInDB = async (game: GameData) => {
    await connectMongoDB();

    await Game.updateOne({ hash: game.hash }, { gameStarted: game.gameStarted }).exec();
}