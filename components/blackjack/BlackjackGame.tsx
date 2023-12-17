"use client";

import { useEffect, useState } from "react";
import BeforeGameStarts from "./BeforeGameStarts";
import GameTable from "./GameTable";
import { SocketAuth } from "@/types/SocketAuthType";
import { socket } from "@/lib/socket";

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
    const [players, setPlayers] = useState<any[]>([]);
    const [dealerCards, setDealerCards] = useState<any[]>([]);
    // const [cardLeftInShoe, setCardsLeftInShoe] = useState<number>(0);

    // let socket = io("http://localhost:3001");
    const authData: SocketAuth = {
        roomId: props.roomId,
        hash: props.gameHash,
        token: props.token,
        username: props.username,
    };

    useEffect(() => {
        socket.connect();

        socket.emit('join_room', authData);

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

        socket.on('preround_update', (data) => {
            console.log("PRE-UPDATE", data);

            setPlayers(data.players);
        });

        socket.on('game_update', (data) => {
            console.log("GAME-UPDATE", data);
            setPlayers(data.players);
            setDealerCards(data.dealerCards);
        });

        return () => {
            socket.off('new_user');
            socket.off('game_started');
            socket.off('preround_update');
            socket.off('game_update');

            socket.disconnect();
        };
    }, []);

    if (showWaitingForGameToStart) {
        return (
            <BeforeGameStarts players={players} gameHash={props.gameHash} currentUserIsCreator={props.currentUserIsCreator} startGame={() => socket.emit('start_game', authData)}></BeforeGameStarts>
        );
    }

    return (
        <>
            {/* teraz w GameTable.tsx jest to co pisałeś */}
            <GameTable players={players} dealerCards={dealerCards} socket={socket} authData={authData}></GameTable>
        </>
    );
}