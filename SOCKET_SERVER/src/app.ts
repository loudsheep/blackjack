import http from "http";
import https from "https";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { EmitEventFunction, IncomingData } from "./types/types";
import { createGamesObject, getGameByRoomId, getGameData, kickPlayer, updateGameStartedInDB } from "./game/gameDataManager";
import { authenticateUser, sendPlayerDataUpdate } from "./lib/auth";
import { cardsLeftInShoe, generateRandomShoe } from "./game/cards";
import { placeBet, setTimeoutForBetting } from "./game/bets";
import { resetStateBeforeNextRound, respondToPlayerAction, startRound } from "./game/round";
import { addPlayerToGame, getPlayerByIdentifier } from "./game/players";
import { readFileSync } from "fs";
import { handlePong } from "./game/ping";
import { cleanInactiveGames } from "./util/util";

dotenv.config({ path: path.resolve(__dirname + "../../../.env") });

const httpServer = process.env.SOCKET_USE_HTTPS == "true" ? https.createServer({
    key: readFileSync(process.env.SOCKET_HTTPS_KEY_PATH),
    cert: readFileSync(process.env.SOCKET_HTTPS_CERT_PATH),
}) : http.createServer();

const io = new Server(httpServer, {
    cors: {
        // origin: "http://localhost:3000", // Replace with frontend URL - TODO
        origin: "*", // Replace with frontend URL - TODO process.env.BASE_PATH
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    }
})

let games = createGamesObject();

io.on('connection', (socket) => {
    const emitEvent: EmitEventFunction = (roomId, event, data) => {
        io.to(roomId).emit(event, data);
    };

    // game realted events
    socket.on('join_room', async (data) => {
        // check if game exists, if not get the game data from mongodb
        let game = getGameByRoomId(games, data.roomId);
        if (!game) {
            await getGameData(games, data.hash, data.roomId);
        }

        // after getting data from db check if it's valid
        game = getGameByRoomId(games, data.roomId);
        if (!game) {
            socket.disconnect();
            return;
        }

        // if game already started and the user connecting is not authenticated disconnect and return
        if (game.gameStarted && !authenticateUser(game, data.token).authenticated) {
            socket.disconnect();
            return;
        }

        await addPlayerToGame(game, data.token, data.username);

        if (game.bannedPlayers.includes(data.token)) {
            return;
        }

        // join 2 rooms. First is general room for every player, and second is secifically for this user to send their updates
        await socket.join([data.roomId, data.token]);

        // new player in room, broadcast this info to the rest of players
        io.to(data.roomId).emit("new_user", game.gameUpdateData());
        // send user data to current player
        sendPlayerDataUpdate(game, emitEvent);

        // if the game does not have a shoe generated then make one
        if (cardsLeftInShoe(game) == 0) {
            generateRandomShoe(game, Number.parseInt(process.env.DECKS_IN_SHOE) || 6);
        }
    });

    socket.on('start_game', async (data: IncomingData) => {
        let game = getGameByRoomId(games, data.roomId);
        let auth = authenticateUser(game, data.token);

        // do nothing if the request is comming from not authenticated user or not a creator
        if (!auth.authenticated || !auth.isCreator) {
            return;
        }

        game.gameStarted = true;
        await updateGameStartedInDB(game);

        // emit game started event for all players
        io.to(game.socketRoomId).emit("game_started", game.gameUpdateData());

        resetStateBeforeNextRound(game);

        setTimeout(() => {
            io.to(game.socketRoomId).emit("hand_starting", game.gameUpdateData())
            game.bettingTime = true;

            sendPlayerDataUpdate(game, emitEvent);
        }, 2_000);
    });

    socket.on('pause_game', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated || !auth.isCreator) {
            return;
        }

        game.pauseRequested = true;

        // if game is still in betting phase and no player has betted yet
        if (game.bettingTime && game.betsClosedTimeout == null) {
            game.gameStarted = false;
            game.pauseRequested = false;

            io.to(game.socketRoomId).emit('game_paused');
            await updateGameStartedInDB(game);
            return;
        }

        io.to(game.socketRoomId).emit('pause_request');
    });

    socket.on('place_bet', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated) {
            socket.disconnect();
            return;
        }

        if (data.bet > auth.playerData.stack) {
            return;
        }

        // if first bet has been placed then start the countdown for the rest of clients, and then start the actual round
        if (placeBet(game, data.bet, auth.playerData.token)) {
            setTimeoutForBetting(game, () => {
                game.betsClosedTimeout = null;
                game.bettingTime = false;

                sendPlayerDataUpdate(game, emitEvent);

                io.to(game.socketRoomId).emit("betting_ended");
                startRound(game, emitEvent);

            }, Number.parseInt(process.env.BETTING_TIMEOUT), () => io.to(game.socketRoomId).emit('bet_timeout_started', { time: Number.parseInt(process.env.BETTING_TIMEOUT) }));

            io.to(game.socketRoomId).emit('preround_update', game.gameUpdateData());

            if (game.currentRound.participants.length == game.players.length) {
                clearTimeout(game.betsClosedTimeout);
                game.betsClosedTimeout = null;
                game.bettingTime = false;

                io.to(game.socketRoomId).emit("betting_ended");
                startRound(game, emitEvent);
            }

            sendPlayerDataUpdate(game, emitEvent);
        }
    });

    socket.on('take_action', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated) {
            return;
        }

        respondToPlayerAction(game, data, emitEvent);
    });

    socket.on('kick', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        // do nothing if the request is comming from not authenticated user or not a creator
        if (!auth.authenticated || !auth.isCreator) {
            return;
        }

        let player = getPlayerByIdentifier(game, data.identifier);
        if (player) {
            kickPlayer(game, player);
            io.to(player.token).emit('kick_disconnect');

            io.to(game.socketRoomId).emit('preround_update', game.gameUpdateData());
        }
    });

    socket.on('ban', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        // do nothing if the request is comming from not authenticated user or not a creator
        if (!auth.authenticated || !auth.isCreator) {
            return;
        }

        let player = getPlayerByIdentifier(game, data.identifier);
        if (player) {
            kickPlayer(game, player);
            io.to(player.token).emit('kick_disconnect');

            io.to(game.socketRoomId).emit('preround_update', game.gameUpdateData());

            game.bannedPlayers.push(player.token);

            updateGameStartedInDB(game);
        }
    });

    // in-game chat events
    socket.on('send_chat_msg', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        // do nothing if the request is comming from not authenticated user
        if (!game.settings.enableChat || !auth.authenticated) {
            return;
        }

        let msg = data.message.substring(0, 50);

        io.to(game.socketRoomId).emit('recieve_chat_msg', { message: msg, author: auth.playerData.identifier, authorName: auth.playerData.username, timestamp: Date.now() });
    });

    socket.on('pong', async (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated) {
            return;
        }

        handlePong(auth.playerData);
    });

    socket.onAny(() => {
        if (Math.random() < 2 / 100) {
            games = cleanInactiveGames(games);
        }
    });
});


// start the server on specified port
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});