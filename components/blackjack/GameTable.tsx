"use client";

import React, { useEffect, useState } from 'react';
import logo from "./images/dealer_shoe.png";
import '../styles/blackjack.css';
import Card from '../Card';
import { Socket } from 'socket.io-client';
import { SocketAuth } from '@/types/SocketAuthType';
import Image from 'next/image';
import BetForm from '../BetForm';
import Countdown from 'react-countdown';
import ChatWindow from './ChatWindow';
import useChatHistory from '@/hooks/useChatHistory';
import { ChatMessage } from '@/types/ChatMessageType';

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
    const [playerActions, setPlayerActions] = useState<string[]>([]);
    const [betCountdown, setBetCountdown] = useState<number | null>(null);
    const [insuranceCountdown, setInsuranceCountdown] = useState<number | null>(null);
    const [showInsurance, setShowInsurance] = useState<boolean>(false);
    const [lastBet, setLastBet] = useState<number>(0);

    const [lastChatMessage, setLastChatMessage] = useState<ChatMessage | null>(null);

    // const [history, setHistory, addToHistory] = useChatHistory();

    const [pauseRequested, setPauseRequested] = useState<boolean>(false);

    const placeBet = (value: number) => {
        socket.emit('place_bet', { auth: authData, bet: value });
        setLastBet(value);
        setShowBettingOptions(false);
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

    useEffect(() => {
        socket.on('hand_starting', (data) => {
            console.log(data, "STARTING");

            // setShowBettingOptions(true);
        });

        socket.on('betting_ended', () => {
            setShowBettingOptions(false);
            setBetCountdown(null);
            console.log("BET END");
        });

        socket.on('bet_timeout_started', (data) => {
            setBetCountdown(Date.now() + data.time);
            console.log("TIMEOUT START");
        });

        socket.on('my_turn', (data) => {
            console.log("MY TURN", data);

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
            }
        });

        socket.on('my_turn_finished', (data) => {
            setShowPlayerActions(false);
            setShowBettingOptions(false);
            setBetCountdown(null);
            setShowInsurance(false);
            setInsuranceCountdown(null);

            console.log("TURN FINISHED");
        });

        socket.on('pause_request', (data) => {
            setPauseRequested(true);
        });

        socket.on('recieve_chat_msg', (data) => {
            setLastChatMessage(data);
        });

        return () => {
            socket.off('hand_starting');
            socket.off('betting_ended');
            socket.off('bet_timeout_started');
            socket.off('my_turn');
            socket.off('my_turn_finished');
            socket.off('pause_requested');
        };
    }, [socket]);

    return (
        <div className='body'>

            <div className="header">
                <div>Game</div>
                <div>Shop</div>
                <div>Rules</div>
                <div>Profile</div>
                {pauseRequested && (
                    <h1 className='font-bold text-red-500'>THE GAME WILL PAUSE BEFORE THE NEXT ROUND</h1>
                )}

                {(currentPlayer.creator && !pauseRequested) && (
                    <button className="relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold ml-5 py-0.5 px-2 rounded-md shadow-md transition-all duration-300" style={{ border: '2px solid #440000' }} onClick={() => socket.emit('pause_game', { auth: authData })}>Pause game</button>
                )}
            </div>
            <div className="table">

                {settings.enableChat && (
                    <ChatWindow sendMessage={sendChatMessage} lastMessage={lastChatMessage} currentUserIdentifier={currentPlayer.identifier}></ChatWindow>
                )}

                <div className="dealer">
                    <div>
                    </div>
                    <div>
                        <p>Dealer cards - {gameData.dealerCardsSum}</p>
                        <div className="dealer_cards">
                            {gameData.dealerCards.map((value: any, idx: any) => (
                                <Card suit={value.suit} value={value.value} key={idx} className='ml-1 h-full'></Card>
                            ))}
                        </div>
                    </div>
                    <div className="deck">
                        <img src={logo.src} alt="aha" />
                        {gameData.cardsLeft} cards left
                    </div>
                </div>
                <div className="players">
                    {gameData.players.map((value: any, idx: any) => (
                        <div key={idx}>
                            <div className="cards mb-8">
                                {Array.isArray(value.hands) && (
                                    <>
                                        {value.hands.map((hand: any, idx: any) => (
                                            <div key={idx} className={'hand text-center rounded-md ' + (gameData.currentPlayer == value.identifier && gameData.currentHand == idx ? 'bg-red-500 bg-opacity-70' : '')}>
                                                {hand.cards.map((card: any, idx2: any) => (
                                                    <Card style={{ bottom: (idx2 * 20) + "px", left: (idx2 * 20) + "px" }} suit={card.suit} value={card.value} key={idx2} className={'w-32 absolute z-[' + idx2 + ']'}></Card>
                                                ))}
                                                <p className='text-center absolute' style={{ bottom: "-1.5rem" }}>
                                                    {hand.handValue.filter((v: any) => v <= 21).length > 0 ? (
                                                        <>{hand.handValue.filter((v: any) => v <= 21).join(" / ")}</>
                                                    ) : (
                                                        <>{hand.handValue[0]}</>
                                                    )}
                                                </p>

                                                <p className='text-center absolute' style={{ bottom: "-3rem" }}>
                                                    <>
                                                        {hand.isDoubled ? (
                                                            <>{hand.bet / 2}$ , {hand.bet / 2}$</>
                                                        ) : (
                                                            <>{hand.bet}$</>
                                                        )}

                                                        {hand.winAmount && (
                                                            <>
                                                                {hand.winAmount > 0 ? (
                                                                    <span className='text-green-500'> +{hand.winAmount}$</span>
                                                                ) : (
                                                                    <span className='text-red-500'> {hand.winAmount}$</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                </p>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div><p>{value.username}</p></div>
                            S: {value.stack}
                            {value.insurance > 0 && (
                                <p>Insurance: {value.insurance}</p>
                            )}
                            {(value.participates === false) && (
                                <p className='font-bold text-red-400'>PLAYER DOES NOT PARTICIPATE</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showPlayerActions && (
                <div className="lover_table">
                    <div className="action_buttons_space">
                        {playerActions.map((action, idx) => (
                            <button key={idx} onClick={() => takeAction(action)}>{action.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
            )}

            {showInsurance && (
                <div className="lover_table">
                    <div className="action_buttons_space">
                        <button onClick={() => insureBet()}>Insure Bet</button>
                        <button onClick={() => setShowInsurance(false)}>X</button>
                    </div>
                </div>
            )}

            {showBettingOptions && (
                <BetForm minValue={settings.minBet} maxValue={Math.min(currentPlayer.stack, settings.maxBet)} startValue={Math.min(lastBet, currentPlayer.stack)} step={Math.min(10, Math.ceil(currentPlayer.stack / 10))} callback={placeBet} confirmButtonText='Place bet' className='w-1/2'></BetForm>
            )}

            {betCountdown !== null && (
                <>
                    Bets:
                    <Countdown date={betCountdown} precision={100} key={betCountdown} className='text-white'></Countdown>
                </>
            )}

            {insuranceCountdown !== null && (
                <>
                    Insurane:
                    <Countdown date={insuranceCountdown} precision={100} key={insuranceCountdown} className='text-white'></Countdown>
                </>
            )}
        </div>
    )
}
