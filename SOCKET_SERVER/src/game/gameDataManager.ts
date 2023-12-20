import { randomBytes } from "crypto";
import Game from "../models/game";
import connectMongoDB from "../lib/mongodb";
import { GameData } from "./gameData";
import { addPlayer } from "./players";

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

    let gameData = new GameData(game.socketRoomId, gameHash, game.active, game.gameStarted, [], { startingStack: game.settings.startingStack, minBet: game.settings.minBet, maxBet: game.settings.maxBet });

    for (const i of game.players) {
        addPlayer(gameData, {
            token: i.token,
            username: i.username,
            tablePosition: i.tablePosition,
            stack: game.settings.startingStack,
            creator: i.creator,
            identifier: randomBytes(10).toString("base64url")
        });
    }

    games.push(gameData);

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

export const addPlayerToGame = (game: GameData, userToken: string, username: string) => {
    if (game.players.find(elem => elem.token == userToken)) {
        return;
    }

    let newUser = {
        token: userToken,
        username: username,
        tablePosition: game.players.length + 1,
        creator: false,
        stack: Math.round(game.settings.startingStack * Math.random()),
        identifier: randomBytes(10).toString("base64url"),
    };

    addPlayer(game, newUser);
    console.log("New player added to game: ", userToken, username);
};

export const updateGameStartedInDB = async (game: GameData) => {
    await connectMongoDB();

    await Game.updateOne({ hash: game.hash }, { gameStarted: game.gameStarted }).exec();
}

export const handStartingData = (game: GameData) => {
    return {
        roomId: game.socketRoomId,
        hash: game.hash,
    };
};