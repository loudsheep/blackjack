import { randomBytes } from "crypto";
import Game from "../models/game";
import connectMongoDB from "../lib/mongodb";
import { GameData } from "./gameData";
import { Player, addPlayer } from "./players";

export const createGamesObject = () => {
    let games: GameData[] = [];
    return games;
}

export const getGameData = async (games: GameData[], gameHash: string): Promise<boolean> => {
    if (games.find(elem => elem.hash == gameHash)) {
        return;
    }

    await connectMongoDB();

    // TODO: change for production
    await Game.updateOne({ hash: gameHash }, {
        gameStarted: false,
        $pull: { players: { creator: false } }
    }).exec();

    let game = await Game.findOne({ hash: gameHash }).exec();
    if (!game || !game.active) {
        return false;
    }

    let gameData = new GameData(game.socketRoomId, gameHash, game.active, game.gameStarted, [], game.settings, game.bannedPlayers);

    for (const i of game.players) {
        addPlayer(gameData, {
            token: i.token,
            username: i.username,
            tablePosition: i.tablePosition,
            stack: game.settings.startingStack,
            creator: i.creator,
            hands: [],
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

export const updateGameStartedInDB = async (game: GameData) => {
    await connectMongoDB();
    await Game.updateOne({ hash: game.hash }, { gameStarted: game.gameStarted, bannedPlayers: game.bannedPlayers }).exec();
}

export const kickPlayer = async (game: GameData, player: Player) => {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].token == player.token) {
            game.players.splice(i, 1);
            break;
        }
    }

    await connectMongoDB();

    await Game.updateOne({ hash: game.hash }, { $pull: { players: { token: player.token } } }).exec();
};

export const addPlayerToGameInDB = async (game: GameData, player: Player) => {
    await connectMongoDB();

    await Game.updateOne(
        { hash: game.hash },
        {
            $push: {
                players: {
                    token: player.token,
                    username: player.username,
                    creator: player.creator,
                    tablePosition: player.tablePosition,
                }
            }
        })
        .exec();
}

export const handStartingData = (game: GameData) => {
    return {
        roomId: game.socketRoomId,
        hash: game.hash,
    };
};