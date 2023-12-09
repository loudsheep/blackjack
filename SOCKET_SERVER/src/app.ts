import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectMongoDB from "./lib/mongodb";
import Game from "./models/game";


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
        creator: boolean
    }[],
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
    await connectMongoDB();

    let game = await Game.find({ hash: gameHash }).exec();

    if (game.length != 1) {
        return false;
    }

    if (!game[0].active) {
        return false;
    }

    games.push({
        socketRoomId: game[0].socketRoomId,
        gameStarted: false,
        hash: gameHash,
        active: game[0].active,
        players: game[0].players,
        deck: null,
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
    game.players.push({
        token: userToken,
        username: username,
        tablePosition: game.players.length + 1,
        creator: false,
    });
    console.log("New player added to game: ", userToken, username);
};


io.on('connection', (socket: any) => {
    console.log("User connected: ", socket.id);

    socket.on('join_room', async (data: IncomingData) => {
        console.log("JOINING ROOM - ", data);
        // let room = data.roomId;
        // let gameHash = data.hash;
        // let userToken = data.token;
        // let username = data.username;

        // let game = getGameByRoomId(data.roomId);
        // if (!game) {
        //     await getGameData("", gameHash);
        // }

        // game = getGameByRoomId(room);

        // if (!game || game?.gameStarted) {
        //     socket.disconnect();
        //     return;
        // }

        // addPlayerToGame(game, userToken, username);

        socket.join(data.roomId);
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