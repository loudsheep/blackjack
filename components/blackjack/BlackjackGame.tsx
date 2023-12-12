"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import BeforeGameStarts from "./BeforeGameStarts";
import GameTable from "./GameTable";
import { SocketAuth } from "@/types/SocketAuthType";

type BlackjacjGameProps = {
    token: string,
    gameHash: string,
    username: string,
    roomId: string,
    currentUserIsCreator: boolean
};

type NewUserType = {
    token: string,
    creator: boolean,
    username: string,
    stack: number,
    tablePosition: number,
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showWaitingForGameToStart, setShowWaitingForGameToStart] = useState<boolean>(true);
    const [players, setPlayers] = useState<NewUserType[]>([]);
    // const [cardLeftInShoe, setCardsLeftInShoe] = useState<number>(0);

    const socket = io("http://localhost:3001");
    const authData: SocketAuth = {
        roomId: props.roomId,
        hash: props.gameHash,
        token: props.token,
        username: props.username,
    };

    const joinRoom = () => {
        socket.emit('join_room', authData);
    };

    useEffect(() => {
        joinRoom();

        socket.on('new_user', (data: any) => {
            console.log(data);
            
            setPlayers(data.players);
            setShowWaitingForGameToStart(!data.gameStarted);
        });

        socket.on('game_started', (data: any) => {
            setShowWaitingForGameToStart(false);
            setPlayers(data.players);
            // setCardsLeftInShoe(data.cardsInShoe);
        });
    }, []);

    if (showWaitingForGameToStart) {
        return (
            <BeforeGameStarts players={players} gameHash={props.gameHash} currentUserIsCreator={props.currentUserIsCreator} startGame={() => socket.emit('start_game', authData)}></BeforeGameStarts>
        );
    }

    return (
        <>
            {/* teraz w GameTable.tsx jest to co pisałeś */}
            <GameTable players={players} dealerCards={[]}></GameTable>
        </>
    );
}