// import http from "http";
// import cors from "cors";
// import { Server } from "socket.io";
// import connectMongoDB from "./lib/mongodb";
// import Game from "./models/game";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var http = require('http');
var cors = require('cors');
var Server = require('socket.io').Server;
var connectMongoDB = require('./lib/mongodb');
var Game = require('./models/game');
var httpServer = http.createServer();
var io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Replace with frontend URL - TODO
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    }
});
var games = [];
var getGameData = function (roomId, gameHash) { return __awaiter(_this, void 0, void 0, function () {
    var game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connectMongoDB()];
            case 1:
                _a.sent();
                return [4 /*yield*/, Game.find({ hash: gameHash }).exec()];
            case 2:
                game = _a.sent();
                if (game.length != 1) {
                    return [2 /*return*/, false];
                }
                if (!game[0].active) {
                    return [2 /*return*/, false];
                }
                games.push({
                    socketRoomId: game[0].socketRoomId,
                    gameStarted: false,
                    hash: gameHash,
                    active: game[0].active,
                    players: game[0].players,
                    deck: null,
                });
                return [2 /*return*/, true];
        }
    });
}); };
var getGameByRoomId = function (roomId) {
    for (var _i = 0, games_1 = games; _i < games_1.length; _i++) {
        var i = games_1[_i];
        if (i.socketRoomId === roomId) {
            return i;
        }
    }
    return null;
};
var getGameByHash = function (hash) {
    for (var _i = 0, games_2 = games; _i < games_2.length; _i++) {
        var i = games_2[_i];
        if (i.hash === hash) {
            return i;
        }
    }
    return null;
};
var addPlayerToGame = function (game, userToken, username) {
    game.players.push({
        token: userToken,
        username: username,
        table_position: game.players.length + 1,
        creator: false,
    });
    console.log("New player added to game: ", userToken, username);
};
io.on('connection', function (socket) {
    console.log("User connected: ", socket.id);
    socket.on('join_room', function (data) { return __awaiter(_this, void 0, void 0, function () {
        var room, gameHash, userToken, username, game;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    room = (_a = data.roomId) !== null && _a !== void 0 ? _a : -1;
                    gameHash = (_b = data.hash) !== null && _b !== void 0 ? _b : -1;
                    userToken = (_c = data.token) !== null && _c !== void 0 ? _c : -1;
                    username = data.username;
                    game = getGameByRoomId(room);
                    if (!!game) return [3 /*break*/, 2];
                    return [4 /*yield*/, getGameData(0, gameHash)];
                case 1:
                    _d.sent();
                    _d.label = 2;
                case 2:
                    game = getGameByRoomId(room);
                    if (!game || (game === null || game === void 0 ? void 0 : game.gameStarted)) {
                        socket.disconnect();
                        return [2 /*return*/];
                    }
                    addPlayerToGame(game, userToken, username);
                    socket.join(data.roomId);
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on("disconnect", function () {
        console.log("A user disconnected:", socket.id);
    });
});
var PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, function () {
    console.log("Socket.io server is running on port ".concat(PORT));
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
