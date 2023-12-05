import { randomBytes } from "crypto";
import connectMongoDB from "@/lib/mongodb";
import Game from "@/models/game";
import { notFound } from "next/navigation";

type GamePageProps = {
    params: {
        gameId: string,
    }
};

export default async function GamePage({ params }: GamePageProps) {
    let randomStr = randomBytes(10).toString('base64url');

    const checkIfGameExists = async () => {
        await connectMongoDB();

        let games = Game.find({ hash: params.gameId, active: true }).exec();
        let gamesLen = (await games).length;

        return gamesLen
    };
    // Game.create({
    //     hash: "aaabbb",
    //     active: true,
    //     players: []
    // });

    if (await checkIfGameExists() == 0) {
        return notFound();
    }

    return (
        <>
            GAME PAGE - {params.gameId} - {randomStr}
        </>
    );
}