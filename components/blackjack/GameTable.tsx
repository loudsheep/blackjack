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

type GameTableProps = {
    players: any,
    dealerCards: any,
    currentPlayer: any,
    socket: Socket,
    authData: SocketAuth,
};

export default function GameTable({ players, socket, authData, dealerCards, currentPlayer }: GameTableProps) {
    const [showBettingOptions, setShowBettingOptions] = useState<boolean>(false);
    const [showPlayerActions, setShowPlayerActions] = useState<boolean>(false);
    const [betCountdown, setBetCountdown] = useState<number | null>(null);

    const placeBet = (value: number) => {
        socket.emit('place_bet', { auth: authData, bet: value });
        setShowBettingOptions(false);
    };

    const takeAction = (action: string) => {
        socket.emit('take_action', { auth: authData, action })
    };

    useEffect(() => {
        socket.on('hand_starting', (data) => {
            console.log(data, "STARTING");

            setShowBettingOptions(true);
        });

        socket.on('betting_ended', () => {
            setShowBettingOptions(false);
            setBetCountdown(null);
        });

        socket.on('bet_timeout_started', (data) => {
            setBetCountdown(Date.now() + data.time);
        });

        socket.on('my_turn', (data) => {
            setShowPlayerActions(true);
        });

        return () => {
            socket.off('hand_starting');
            socket.off('betting_ended');
            socket.off('bet_timeout_started');
            socket.off('my_turn');
        };
    }, [socket]);

    return (
        <div className='body'>
            <div className="header">
                <div>Game</div>
                <div>Shop</div>
                <div>Rules</div>
                <div>Profile</div>
            </div>
            <div className="table">
                <div className="dealer">
                    <div>
                    </div>
                    <div>
                        <p>Dealer cards</p>
                        <div className="dealer_cards">
                            {dealerCards.map((value: any, idx: any) => (
                                <Card suit={value.suit} value={value.value} key={idx} className='ml-1 h-full'></Card>
                            ))}
                        </div>
                    </div>
                    <div className="deck">
                        <img src={logo.src} alt="aha" />
                    </div>
                </div>
                <div className="players">
                    {players.map((value: any, idx: any) => (
                        <div key={idx}>
                            <div className="cards">
                                {Array.isArray(value.hands) && (
                                    <>
                                        {value.hands.map((hand: any, idx: any) => (
                                            <div key={idx} className='hand'>
                                                {hand.cards.map((card: any, idx2: any) => (
                                                    <Card style={{ bottom: (idx2 * 20) + "px", left: (idx2 * 20) + "px" }} suit={card.suit} value={card.value} key={idx2} className={'w-32 absolute z-[' + idx2 + ']'}></Card>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div><p>{value.username}</p></div>
                            {value.stack}
                            {value.roundBet && (
                                <p>
                                    Bet: {value.roundBet}
                                </p>
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
                        <button onClick={() => takeAction('double')}>DOUBLE</button>
                        <button onClick={() => takeAction('split')}>SPLIT</button>
                        <button onClick={() => takeAction('stand')}>STAND</button>
                        <button onClick={() => takeAction('hit')}>HIT</button>
                    </div>
                </div>
            )}

            {showBettingOptions && (
                <BetForm minValue={0} maxValue={currentPlayer.stack} startValue={0} step={10} callback={placeBet} confirmButtonText='Place bet' className='w-1/2'></BetForm>
            )}

            {betCountdown !== null && (
                <Countdown date={betCountdown} precision={100} key={betCountdown}></Countdown>
            )}
        </div>
    )
}
