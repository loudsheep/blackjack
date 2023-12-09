import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectMongoDB from "./lib/mongodb";
import Game from "./models/game";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES } from "react";
import dotenv from "dotenv";

dotenv.config();

// let http = require('http');
// let cors = require('cors');
// let { Server } = require('socket.io');
// let connectMongoDB = require('./lib/mongodb');
// let Game = require('./models/game');

const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Replace with frontend URL - TODO
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    }
})

type Card = {
    suit: string,
    value: string,
};

type GameData = {
    socketRoomId: string,
    hash: string,
    active: boolean,
    gameStarted: boolean,
    players: {
        token: string,
        username: string,
        tablePosition: number,
        creator: boolean,
        stack: number,
    }[],
    settings: {
        startingStack: number,
        minBet: number,
        maxBet: number,
    }
    deck: Card[] | null,
};

type IncomingData = {
    roomId: string,
    hash: string,
    token: string,
    username: string,
};

let games: GameData[] = [];

const getGameData = async (roomId: string, gameHash: string) => {
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
        deck: null,
        settings: {
            startingStack: game.settings.startingStack,
            minBet: game.settings.minBet,
            maxBet: game.settings.maxBet,
        },
    });

    return true;
}

const getGameByRoomId = (roomId: string) => {
    for (const i of games) {
        if (i.socketRoomId === roomId) {
            return i;
        }
    }
    return null;
};

const getGameByHash = (hash: string) => {
    for (const i of games) {
        if (i.hash === hash) {
            return i;
        }
    }
    return null;
};

const addPlayerToGame = (game: GameData, userToken: string, username: string) => {
    if (game.players.find(elem => elem.token == userToken)) {
        return;
    }

    let newUser = {
        token: userToken,
        username: username,
        tablePosition: game.players.length + 1,
        creator: false,
        stack: game.settings.startingStack
    };

    game.players.push(newUser);
    console.log("New player added to game: ", userToken, username);
};


io.on('connection', (socket) => {
    console.log("User connected: ", socket.id);

    socket.on('join_room', async (data: IncomingData) => {
        console.log("JOINING ROOM - ", data);

        let game = getGameByRoomId(data.roomId);
        if (!game) {
            await getGameData("", data.hash);
        }

        game = getGameByRoomId(data.roomId);

        if (!game) {
            socket.disconnect();
            return;
        }

        addPlayerToGame(game, data.token, data.username);

        await socket.join(data.roomId);
        io.to(data.roomId).emit("new_user", game.players);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});


const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});



// const { Server } = require("socket.io");
// const cors = require("cors");
// const connectMongoDB = require("./lib/mongodb");

// const httpServer = http.createServer();

// const io = new Server(httpServer, {
//     cors: {
//         origin: "http://localhost:3000", // Replace with your frontend URL
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true,
//     },
// });

// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);
//     socket.on("join_room", (roomId) => {
//         socket.join(roomId);
//         console.log(`user with id-${socket.id} joined room - ${roomId}`);
//     });

//     socket.on("send_msg", (data) => {
//         console.log(data, "DATA");
//         //This will send a message to a specific room ID
//         socket.to(data.roomId).emit("receive_msg", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("A user disconnected:", socket.id);
//     });
// });

// const PORT = process.env.SOCKET_PORT || 3001;
// httpServer.listen(PORT, () => {
//     console.log(`Socket.io server is running on port ${PORT}`);
// });