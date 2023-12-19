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
    const [currentPlayer, setCurrentPlayer] = useState<any>({});
    // const [cardLeftInShoe, setCardsLeftInShoe] = useState<number>(0);

    const authData: SocketAuth = {
        roomId: props.roomId,
        hash: props.gameHash,
        token: props.token,
        username: props.username,
    };

    const updateGameState = (data: any) => {
        setPlayers(data.players);
        setShowWaitingForGameToStart(!data.gameStarted);
        setDealerCards(data.dealerCards);

        for (const player of data.players) {
            if (player.token == authData.token) {
                console.log(player.stack);

                setCurrentPlayer(player);
            }
        }
    };

    useEffect(() => {
        socket.connect();

        socket.emit('join_room', authData);

        socket.on('new_user', (data: any) => {
            console.log(data);

            updateGameState(data);
        });

        socket.on('game_started', (data: any) => {
            setShowWaitingForGameToStart(false);
            updateGameState(data);
        });

        socket.on('preround_update', (data) => {
            console.log("PRE-UPDATE", data);
            updateGameState(data);
        });

        socket.on('game_update', (data) => {
            console.log("GAME-UPDATE", data);
            updateGameState(data);
        });

        socket.on('player_update', (data) => {
            setCurrentPlayer(data);
        });

        return () => {
            socket.off('new_user');
            socket.off('game_started');
            socket.off('preround_update');
            socket.off('game_update');
            socket.off('player_update');

            socket.disconnect();
        };
    }, []);

    if (showWaitingForGameToStart) {
        return (
            <BeforeGameStarts players={players} gameHash={props.gameHash} currentUserIsCreator={props.currentUserIsCreator} startGame={() => socket.emit('start_game', authData)} ></BeforeGameStarts>
        );
    }

    return (
        <>
            {/* teraz w GameTable.tsx jest to co pisałeś */}
            <GameTable players={players} dealerCards={dealerCards} socket={socket} authData={authData} currentPlayer={currentPlayer}></GameTable>
        </>
    );
}