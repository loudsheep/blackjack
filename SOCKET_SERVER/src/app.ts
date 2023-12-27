import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { IncomingData } from "./types/IncomingDataType";
import { createGamesObject, getGameByRoomId, getGameData } from "./game/gameDataManager";
import { authenticateUser, sendPlayerDataUpdate } from "./lib/auth";
import { cardsLeftInShoe, generateRandomShoe } from "./game/cards";
import { placeBet, setTimeoutForBetting } from "./game/bets";
import { resetStateBeforeNextRound, respondToPlayerAction, startRound } from "./game/round";
import { addPlayerToGame } from "./game/players";

dotenv.config({ path: path.resolve(__dirname + "../../../.env") });
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Replace with frontend URL - TODO
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    }
})

let games = createGamesObject();

io.on('connection', (socket) => {
    const emitEvent = (roomId: string | string[], event: string, data: any) => {
        io.to(roomId).emit(event, data);
    };

    socket.on('join_room', async (data) => {
        // check if game exists, if not get the game data from mongodb
        let game = getGameByRoomId(games, data.roomId);
        if (!game) {
            await getGameData(games, data.hash);
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

        addPlayerToGame(game, data.token, data.username);

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
        // await updateGameStartedInDB(game);

        // emit game started event for all players
        io.to(game.socketRoomId).emit("game_started", game.gameUpdateData());

        resetStateBeforeNextRound(game);

        sendPlayerDataUpdate(game, emitEvent);

        setTimeout(() => io.to(game.socketRoomId).emit("hand_starting", game.gameUpdateData()), 2_000);
    });

    // socket.on('pause_game', async (data) => {
    //     let game = getGameByRoomId(games, data.roomId);
    //     let auth = authenticateUser(game, data.token);

    //     if (!auth.authenticated || !auth.isCreator) {
    //         return;
    //     }

    //     game.pauseRequested = true;
    //     // await updateGameStartedInDB(game);

    //     io.to(game.socketRoomId).emit('pause_request');
    // });

    socket.on('place_bet', (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated) {
            socket.disconnect();
            return;
        }
        if (data.bet > auth.playerData.stack) {
            return;
        }

        // if bet has been placed then start the countdown for the rest of clients, and then start the actual round
        if (placeBet(game, data.bet, auth.playerData.token)) {

            setTimeoutForBetting(game, () => {
                io.to(game.socketRoomId).emit("betting_ended");

                startRound(game, emitEvent);
                // manageStartedRound(game, emitEvent);

                // game.dealAllCards();
                // io.to(game.socketRoomId).emit('game_update', game.gameUpdateData());
            }, 8000, () => io.to(game.socketRoomId).emit('bet_timeout_started', { time: 8000 }));

            sendPlayerDataUpdate(game, emitEvent);
            io.to(game.socketRoomId).emit('preround_update', game.gameUpdateData());
        }
    });

    socket.on('take_action', (data) => {
        let game = getGameByRoomId(games, data.auth.roomId);
        let auth = authenticateUser(game, data.auth.token);

        if (!auth.authenticated) {
            return;
        }

        respondToPlayerAction(game, data, emitEvent);
    });

    // socket.on("disconnect", () => {
    //     // disconnect logic
    // });
});


// start the server on specified port
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});