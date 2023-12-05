import { randomBytes } from "crypto";

type GamePageProps = {
    params: {
        gameId: string,
    }
};

export default function GamePage({ params }: GamePageProps) {
    let randomStr = randomBytes(10).toString('base64url');

    return (
        <>
            GAME PAGE - {params.gameId} - {randomStr}
        </>
    );
}