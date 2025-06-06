"use client";

import React, { useEffect, useState } from 'react';
import logo from "./images/dealer_shoe.png";
import '../styles/blackjack.css';
import Card from '../Card';
import { Socket } from 'socket.io-client';
import { SocketAuth } from '@/types/SocketAuthType';
import Countdown from 'react-countdown';
import ChatWindow from './ChatWindow';
import useChatHistory from '@/hooks/useChatHistory';
import { ChatMessage } from '@/types/ChatMessageType';
import BetWithChips from './BetWithChips';
import ActionTimer from './ActionTimer';
import PlayerSlot from './PlayerSlot';
import PlayerActions from './PlayerActions';


const mapPlayersToDisplay = (players: any, currentPlayerToken: string | null = null) => {
    if (currentPlayerToken) {
        for (const player of players) {
            if (player.identifier === currentPlayerToken) {
                return [player];
            }
        }
    }


    let result = [];
    for (let i = 0; i < 5; i++) result.push({ empty: true });

    for (const player of players) {
        if (player.tablePosition >= 0 && player.tablePosition < result.length) {
            result[player.tablePosition] = player;
        }
    }

    return result;
};


type GameTableProps = {
    gameData: any,
    // players: any,
    // dealerCards: any,
    // dealerCardsSum: number,
    currentPlayer: any,
    socket: Socket,
    authData: SocketAuth,
    settings: {
        minBet: number,
        maxBet: number,
        startingStack: number,
        enableChat: boolean
    },
    // cardsInShoe: number,
};

// TODO change this { players, socket, authData, ... } to just props: GameTableProps
export default function GameTable({ socket, authData, currentPlayer, settings, gameData }: GameTableProps) {
    const [showBettingOptions, setShowBettingOptions] = useState<boolean>(false);
    const [showPlayerActions, setShowPlayerActions] = useState<boolean>(false);
    const [showInsurance, setShowInsurance] = useState<boolean>(false);

    const [playerActions, setPlayerActions] = useState<string[]>([]);
    const [betCountdown, setBetCountdown] = useState<number | null>(null);
    const [insuranceCountdown, setInsuranceCountdown] = useState<number | null>(null);
    const [actionTimeout, setActionTimeout] = useState<number | null>(null);
    const { chatHistory, addMessage } = useChatHistory();
    const [pauseRequested, setPauseRequested] = useState<boolean>(false);
    

    const placeBet = (value: number) => {
        if (value > 0) {
            socket.emit('place_bet', { auth: authData, bet: value });
            setShowBettingOptions(false);
        }
    };

    const takeAction = (action: string) => {
        socket.emit('take_action', { auth: authData, action })
    };

    const sendChatMessage = (message: string) => {
        if (settings.enableChat) {
            socket.emit("send_chat_msg", { auth: authData, message });
        }
    };

    const insureBet = () => {
        socket.emit('take_action', { auth: authData, action: "insure" })
    };

    const hanldeIncuraceAction = (action: string) => {
        if (action == "insure bet") {
            insureBet();
        }
        setShowInsurance(false)
    };

    useEffect(() => {
        socket.on('hand_starting', (data) => {
            // setShowBettingOptions(true);
        });

        socket.on('betting_ended', () => {
            setShowBettingOptions(false);
            setBetCountdown(null);
        });

        socket.on('bet_timeout_started', (data) => {
            setBetCountdown(Date.now() + data.time);
        });

        socket.on('action_timeout_started', (data) => {
            setActionTimeout(null);
            setActionTimeout(Date.now() + data.time);
        });

        socket.on('my_turn', (data) => {
            if (data.type == "bet") {
                if (data.time) setBetCountdown(Date.now() + data.time);
                setShowBettingOptions(true);
            } else if (data.type == "bet_timeout") {
                if (data.time) setBetCountdown(Date.now() + data.time);
            } else if (data.type == "insurance") {
                if (data.time) setInsuranceCountdown(Date.now() + data.time);
                setShowInsurance(true);
            } else if (data.type == "insurance_timeout") {
                if (data.time) setInsuranceCountdown(Date.now() + data.time);
            } else if (data.type == "cardAction") {
                setShowPlayerActions(true);
                setPlayerActions(data.actions);
                if (data.time) setActionTimeout(Date.now() + data.time);
            }
        });

        socket.on('my_turn_finished', (data) => {
            setShowPlayerActions(false);
            setShowBettingOptions(false);
            setBetCountdown(null);
            setShowInsurance(false);
            setInsuranceCountdown(null);
            setActionTimeout(null);
        });

        socket.on('pause_request', (data) => {
            setPauseRequested(true);
        });

        socket.on('recieve_chat_msg', (data) => {
            console.log("RECIEVE");

            addMessage(data);
        });

        return () => {
            socket.off('hand_starting');
            socket.off('betting_ended');
            socket.off('bet_timeout_started');
            socket.off('my_turn');
            socket.off('my_turn_finished');
            socket.off('pause_requested');
            socket.off('recieve_chat_msg');
        };
    }, [socket]);

    return (
        <div className='body select-none'>
            <div className="absolute right-0 top-0">
                {pauseRequested && (
                    <h1 className='font-bold text-red-500'>THE GAME WILL PAUSE BEFORE THE NEXT ROUND</h1>
                )}

                {(currentPlayer.creator && !pauseRequested) && (
                    <button className="relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold ml-5 py-0.5 px-2 rounded-md shadow-md transition-all duration-300" style={{ border: '2px solid #440000' }} onClick={() => socket.emit('pause_game', { auth: authData })}>Pause game</button>
                )}
            </div>

            <div className='hidden sm:block'>
                {settings.enableChat && (
                    <ChatWindow sendMessage={sendChatMessage} lastMessages={chatHistory} currentUserIdentifier={currentPlayer.identifier}></ChatWindow>
                )}
            </div>

            <div className="table">
                <div className="w-full flex flex-col justify-center items-center">
                    <div className='flex-[1]'>
                        <p>Dealer cards - {gameData.dealerCardsSum}</p>
                    </div>
                    {gameData.dealerCards.length == 0 && (
                        <div className='flex'>
                            <div className='h-[190px] aspect-[5/7] border-2 border-yellow-400 rounded-lg flex justify-center items-center flex-col text-2xl font-bold text-yellow-400 text-opacity-20 uppercase mx-1'></div>
                            <div className='h-[190px] aspect-[5/7] border-2 border-yellow-400 rounded-lg flex justify-center items-center flex-col text-2xl font-bold text-yellow-400 text-opacity-20 uppercase mx-1'></div>
                        </div>
                    )}
                    <div className="flex-[9] w-full flex justify-center items-center">
                        {gameData.dealerCards.map((value: any, idx: any) => (
                            <Card suit={value.suit} value={value.value} key={idx} className='ml-1 max-h-[150px] md:h-[190px]'></Card>
                        ))}
                    </div>
                </div>

                <div className='hidden md:flex absolute w-full flex-row-reverse left-0 top-[50%]'>
                    {mapPlayersToDisplay(gameData.players).map((value: any, idx: number) => (
                        <PlayerSlot key={idx} playerData={value} currentHand={gameData.currentHand} currentPlayer={gameData.currentPlayer}></PlayerSlot>
                    ))}
                </div>

                <div className='md:hidden absolute w-full flex flex-row-reverse left-0 top-[35%]'>
                    {mapPlayersToDisplay(gameData.players, currentPlayer.identifier).map((value: any, idx: number) => (
                        <PlayerSlot key={idx} playerData={value} currentHand={gameData.currentHand} currentPlayer={gameData.currentPlayer}></PlayerSlot>
                    ))}
                </div>
            </div>

            {showPlayerActions && (
                <PlayerActions actions={playerActions} actionCallback={takeAction}></PlayerActions>
            )}

            {showInsurance && (
                <PlayerActions actions={["insure bet", "x"]} actionCallback={hanldeIncuraceAction}></PlayerActions>
            )}

            {showBettingOptions && (
                <BetWithChips userStack={currentPlayer.stack} placeBetCallback={placeBet}></BetWithChips>
            )}

            {betCountdown !== null && (
                <ActionTimer maxTimeMs={10 * 1000} countUntil={betCountdown} countName='betting'></ActionTimer>
            )}

            {insuranceCountdown !== null && (
                <ActionTimer maxTimeMs={10 * 1000} countUntil={insuranceCountdown} countName='insurance'></ActionTimer>
            )}

            {actionTimeout !== null && (
                <ActionTimer maxTimeMs={10 * 1000} countUntil={actionTimeout} countName='action' key={actionTimeout}></ActionTimer>
            )}
        </div>
    )
}
