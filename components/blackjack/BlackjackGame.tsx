"use client";

import { useState } from "react";
import { io } from "socket.io-client";

type BlackjacjGameProps = {
    token: string,
    gameHash: string,
    username: string,
    roomId: string,
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    // const socket = io("http://localhost:3001");

    return (
        <>
            THIS IS BLACKJACK GAME COMPONENT
        </>
    );
}