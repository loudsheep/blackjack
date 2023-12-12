import http from "http";
import { Server } from "socket.io";
import connectMongoDB from "./lib/mongodb";
import Game from "./models/game";
import dotenv from "dotenv";
import path from "path";
import { IncomingData } from "./types/IncomingDataType";
import { addPlayerToGame, createGamesObject, getGameByRoomId, getGameData, updateGameStartedInDB } from "./game/gameManager";
import { authenticateUser } from "./lib/auth";
import { generateDeck } from "./game/cardDeck";

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

    socket.on('join_room', async (data: IncomingData) => {
        let game = getGameByRoomId(games, data.roomId);
        if (!game) {
            await getGameData(games, data.hash);
        }

        game = getGameByRoomId(games, data.roomId);
        if (!game) {
            socket.disconnect();
            return;
        }
        
        if (game.gameStarted && !authenticateUser(game, data.token).authenticated) {
            socket.disconnect();
            return;
        }

        addPlayerToGame(game, data.token, data.username);

        await socket.join(data.roomId);
        io.to(data.roomId).emit("new_user", { players: game.players, gameStarted: game.gameStarted });

        if (game.cardsLeftInShoe() == 0) {
            game.generateRandomShoe(Number.parseInt(process.env.DECKS_IN_SHOE) || 6);
        }
    });

    socket.on('start_game', async (data: IncomingData) => {
        let game = getGameByRoomId(games, data.roomId);
        let auth = authenticateUser(game, data.token);

        if (!auth.authenticated || !auth.isCreator) {
            return;
        }

        game.gameStarted = true;

        // await updateGameStartedInDB(game);

        io.to(game.socketRoomId).emit("game_started", { players: game.players, cardsInShoe: game.cardsLeftInShoe() });

        io.timeout(1000).to(game.socketRoomId).emit("hand_starting");
    });

    socket.on("disconnect", () => {
        // disconnect logic
    });
});


// start the server on specified port
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});