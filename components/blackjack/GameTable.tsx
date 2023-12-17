"use client";

import React, { useEffect, useState } from 'react';
import logo from "./images/dealer_shoe.png";
import '../styles/blackjack.css';
import Card from '../Card';
import { Socket } from 'socket.io-client';
import { SocketAuth } from '@/types/SocketAuthType';
import Image from 'next/image';

type GameTableProps = {
    players: any,
    dealerCards: any,
    socket: Socket,
    authData: SocketAuth,
    setPlayers: any,
};

export default function GameTable({ players, socket, authData, setPlayers }: GameTableProps) {
    const [showBettingOptions, setShowBettingOptions] = useState<boolean>(false);

    const placeBet = () => {
        socket.emit('place_bet', { auth: authData, bet: 50 })
    };

    useEffect(() => {
        socket.on('hand_starting', (data) => {
            console.log(data, "STARTING");

            setShowBettingOptions(true);
        });

        socket.on('betting_ended', (data) => {
            setShowBettingOptions(false);
        });

        return () => {
            socket.off('hand_starting');
            socket.off('betting_ended');
        };
    }, [socket]);

    return (
        <>
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
                    <div><p>Dealer</p><p>cards</p>
                        <div className="dealer_cards">
                            <div className="dealer_card"></div>
                        </div>
                    </div>
                    <div className="deck">
                        <img src={logo.src} alt="aha" />
                    </div>
                </div>
                {/* <Card suit='diamonds' value='king' className='h-20'></Card> */}
                <div className="players">
                    {players.map((value: any, idx: any) => (
                        <div key={idx}>
                            <div><p>{value.username}</p><p>cards</p></div>
                            <div className="cards">
                                <div className="card"></div>
                            </div>

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
            <div className="lover_table">
                <div className="action_buttons_space">
                    <button>DOUBLE</button>
                    <button>SPLIT</button>
                    <button>STAND</button>
                    <button>HIT</button>
                </div>
            </div>
            {showBettingOptions && (
                <button className='text-black' onClick={placeBet}>Place a bet</button>
            )}
        </>
    )
}
