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
    currentUserIsCreator: boolean,
    settings: {
        minBet: number,
        maxBet: number,
        startingStack: number,
        enableChat: boolean,
    },
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showWaitingForGameToStart, setShowWaitingForGameToStart] = useState<boolean>(true);
    const [gameData, setGameData] = useState<any>({});
    const [currentPlayer, setCurrentPlayer] = useState<any>({});
    const authData: SocketAuth = {
        roomId: props.roomId,
        hash: props.gameHash,
        token: props.token,
        username: props.username,
    };

    const updateGameState = (data: any) => {
        setShowWaitingForGameToStart(!data.gameStarted);

        setGameData(data);
        console.log(data);


        for (const player of data.players) {
            if (player.token == authData.token) {
                console.log(player.stack);

                setCurrentPlayer(player);
            }
        }
    };

    const kick = (identifier: string) => {
        socket.emit("kick", { auth: authData, identifier })
    };

    const ban = (identifier: string) => {
        socket.emit("ban", { auth: authData, identifier })
    };

    useEffect(() => {
        socket.connect();

        socket.emit('join_room', authData);

        socket.on('ping', () => {
            socket.emit("pong", { auth: authData });
        });

        socket.on('new_user', (data: any) => {
            updateGameState(data);
        });

        socket.on('game_started', (data: any) => {
            setShowWaitingForGameToStart(false);
            updateGameState(data);
        });

        socket.on('game_paused', (data: any) => {
            setShowWaitingForGameToStart(true);
        });

        socket.on('preround_update', (data) => {
            updateGameState(data);
            // setCardsLeftInShoe(data.cardsLeft);
        });

        socket.on('game_update', (data) => {
            updateGameState(data);
            // setCardsLeftInShoe(data.cardsLeft);
        });

        socket.on('player_update', (data) => {
            setCurrentPlayer(data);
        });

        socket.on('kick_disconnect', (data) => {
            socket.disconnect();
            window.location.replace("/");
        });

        return () => {
            socket.off('ping');
            socket.off('new_user');
            socket.off('game_started');
            socket.off('game_paused');
            socket.off('preround_update');
            socket.off('game_update');
            socket.off('player_update');

            socket.disconnect();
        };
    }, []);

    if (showWaitingForGameToStart) {
        return (
            <BeforeGameStarts players={gameData.players} gameHash={props.gameHash} currentUserIsCreator={props.currentUserIsCreator} startGame={() => socket.emit('start_game', authData)} kickPlayer={kick} banPlayer={ban}></BeforeGameStarts>
        );
    }

    return (
        <>
            <GameTable gameData={gameData} socket={socket} authData={authData} currentPlayer={currentPlayer} settings={props.settings}></GameTable>
        </>
    );
}