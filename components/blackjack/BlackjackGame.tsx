"use client";

import { SocketIncomingData } from "@/types/SocketIncomingDataType";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type BlackjacjGameProps = {
    token: string,
    gameHash: string,
    username: string,
    roomId: string,
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const socket = io("http://localhost:3001");

    const joinRoom = () => {
        let data: SocketIncomingData = {
            roomId: props.roomId,
            hash: props.gameHash,
            token: props.token,
            username: props.username,
        };

        socket.emit('join_room', data);
    };

    useEffect(() => {
        joinRoom();
    }, []);

    return (
        <>
            THIS IS BLACKJACK GAME COMPONENT
        </>
    );
}