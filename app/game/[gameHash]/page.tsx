import connectMongoDB from "@/lib/mongodb";
import Game from "@/models/game";
import User from "@/models/user";
import { notFound } from "next/navigation";
import { cookies } from 'next/headers';
import CreateUserName from "@/components/CreateUserName";
import BlackjackGame from "@/components/blackjack/BlackjackGame";
import GameAlreadyStarted from "@/components/GameAlreadyStarted";

type GamePageProps = {
    params: {
        gameHash: string,
    }
};

const checkIfGameExists = async (hash: string) => {
    let game = await Game.findOne({ hash: hash, active: true }).exec();

    return game;
};

const checkIfUserIsPartOfTheGame = async (game: any, token: string) => {
    let gameData = await Game.findOne({ "hash": game.hash, "active": true, "players.token": token }).exec();

    if (!gameData) return false;
    return true;
};

const getGameSocketRoomId = async (hash: string) => {
    let game = await Game.findOne({ hash: hash, active: true }).exec();

    if (!game) {
        return -1;
    }

    return game.socketRoomId;
}

const getUserameFromToken = async (token: string) => {
    let user = await User.findOne({ token }).exec();

    if (!user) return null;

    return user.username;
}

export default async function GamePage({ params }: GamePageProps) {
    let user_token = cookies().get('user_token');

    await connectMongoDB();

    // TODO check if game started and if user is the participant of the game, only if not throw 404
    let game = await checkIfGameExists(params.gameHash)
    if (!game) {
        return notFound();
    }

    if (!user_token) {
        return (
            <CreateUserName redirectUrl={`/game/${params.gameHash}`} h1="Create a username" h2="Before you join the game"></CreateUserName>
        );
    }

    if (game.bannedPlayers.includes(user_token.value)) return notFound();

    let username = await getUserameFromToken(user_token.value);
    if (!username) {
        return (
            <CreateUserName redirectUrl={`/game/${params.gameHash}`} h1="Enter yout username" h2="Before you join the game"></CreateUserName>
        );
    }

    let roomId = await getGameSocketRoomId(params.gameHash);
    if (roomId === -1) return notFound();

    if (game.gameStarted) {
        if (!(await checkIfUserIsPartOfTheGame(game, user_token.value))) return <GameAlreadyStarted></GameAlreadyStarted>;
    }

    let isCreator = false;
    for (const iterator of game.players) {
        if (iterator.creator && iterator.token == user_token.value) {
            isCreator = true;
            break;
        }
    }
    // TODO join game via route /game/join
    let settings = {
        startingStack: game.settings.startingStack,
        // enableChat: game.
    }

    return (
        <BlackjackGame token={user_token.value} gameHash={params.gameHash} username={username} roomId={roomId} currentUserIsCreator={isCreator} settings={game.settings}></BlackjackGame>
    );
}