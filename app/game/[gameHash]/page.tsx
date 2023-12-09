import connectMongoDB from "@/lib/mongodb";
import Game from "@/models/game";
import User from "@/models/user";
import { notFound } from "next/navigation";
import { cookies } from 'next/headers';
import CreateUserName from "@/components/CreateUserName";
import BlackjackGame from "@/components/blackjack/BlackjackGame";

type GamePageProps = {
    params: {
        gameHash: string,
    }
};

const checkIfGameExists = async (hash: string) => {
    let games = await Game.findOne({ hash: hash, active: true, gameStarted: false }).exec();

    return games;
};

const getGameSocketRoomId = async (hash: string) => {
    let games = await Game.findOne({ hash: hash, active: true, gameStarted: false }).exec();

    if (!games) {
        return -1;
    }

    return games.socketRoomId;
}

const getUserameFromToken = async (token: string) => {
    let user = await User.findOne({ token }).exec();

    if (!user) return null;

    return user.username;
}

export default async function GamePage({ params }: GamePageProps) {
    let user_token = cookies().get('user_token');

    await connectMongoDB();

    if (!(await checkIfGameExists(params.gameHash))) {
        return notFound();
    }

    if (!user_token || !(await getUserameFromToken(user_token.value))) {
        return (
            <CreateUserName redirectUrl={`/game/${params.gameHash}`}></CreateUserName>
        );
    }

    let username = await getUserameFromToken(user_token.value);
    if (!username) {
        return (
            <CreateUserName redirectUrl={`/game/${params.gameHash}`}></CreateUserName>
        );
    }

    let roomId = await getGameSocketRoomId(params.gameHash);
    if (roomId === -1) return notFound();

    // TODO join game via route /game/join

    return (
        <BlackjackGame token={user_token.value} gameHash={params.gameHash} username={username} roomId={roomId}></BlackjackGame>
    );
}