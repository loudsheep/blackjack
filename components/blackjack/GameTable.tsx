"use client";

import React, { useEffect, useState } from 'react';
import logo from "./images/dealer_shoe.png";
import '../styles/blackjack.css';
import Card from '../Card';
import { Socket } from 'socket.io-client';
import { SocketAuth } from '@/types/SocketAuthType';
import Image from 'next/image';
import BetForm from '../BetForm';

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

    const placeBet = (value: number) => {
        socket.emit('place_bet', { auth: authData, bet: value });
        setShowBettingOptions(false);
    };

    const deal = () => {
        socket.emit('deal', { auth: authData });
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
                    <div><p>Dealer cards</p>
                        <div className="dealer_cards">
                            {dealerCards.map((value: any, idx: any) => (
                                <Card suit={value.suit} value={value.value} key={idx} className='ml-1'></Card>
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
                                {Array.isArray(value.cards) && (
                                    <>
                                        {value.cards.map((hand: any, idx: any) => (
                                            <div key={idx} className='card'>
                                                {hand.map((card: any, idx2: any) => (
                                                    <Card style={{ bottom: (idx2 * 30) + "px", left: (idx2 * 30) + "px" }} suit={card.suit} value={card.value} key={idx2} className={'w-32 absolute z-[' + idx2 + ']'}></Card>
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
                        <button>DOUBLE</button>
                        <button>SPLIT</button>
                        <button>STAND</button>
                        <button>HIT</button>
                    </div>
                </div>
            )}

            {showBettingOptions && (
                <BetForm minValue={0} maxValue={currentPlayer.stack} startValue={0} step={10} callback={placeBet} confirmButtonText='Place bet' className='w-1/2'></BetForm>
            )}

            {/* <button onClick={deal}>Deal card</button> */}
        </div>
    )
}
