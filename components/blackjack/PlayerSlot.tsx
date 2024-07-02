"use client";

import React from 'react'
import PlayerHand from './PlayerHand';
import HandResultMessage from './HandResultMessage';
import TurnIndicator from './TurnIndicator';

type PlayerSlotProps = {
    playerData: any,
    currentHand: number,
    currentPlayer: string,
};

const winMessageText = (amount: number) => {
    if (amount == 0) return "PUSH";
    if (amount > 0) return "Won: " + amount + "$";
    return "Lost: " + (-amount) + "$";
};

export default function PlayerSlot({ playerData, currentHand, currentPlayer }: PlayerSlotProps) {
    if (playerData.empty) {
        return (
            <div className='flex-1 px-10 py-2 flex flex-col justify-center items-center'>
                <div className='h-[20vh] aspect-[5/7] border-2 border-yellow-400 rounded-lg flex justify-center items-center flex-col text-2xl font-bold text-yellow-400 text-opacity-20 uppercase'>
                    <p>empty</p>
                    <p>slot</p>
                </div>
                &nbsp;
            </div>
        )
    }

    if (!Array.isArray(playerData.hands) || playerData.hands.length == 0) {
        return (
            <div className='flex-1 px-10 py-2 flex flex-col justify-center items-center'>
                <div className='h-[20vh] aspect-[5/7] border-2 border-yellow-400 rounded-lg flex justify-center items-center flex-col text-xl font-bold uppercase'>
                    {playerData.participates == false && (
                        <p className='text-center text-red-500 text-opacity-80'>player does not partisipate in this round</p>
                    )}

                    {playerData.roundBet > 0 && (
                        <p className='text-center'>Bet: {playerData.roundBet}</p>
                    )}
                </div>
                {playerData.username}
            </div>
        )
    }

    if (playerData.hands.length == 1) {
        return (
            <div className='flex-1 px-10 py-2 flex flex-col justify-center items-center overflow-visible relative'>
                <PlayerHand hand={playerData.hands[0]}></PlayerHand>

                <div className='flex flex-col'>
                    <p>Bet: {playerData.hands[0].bet} {playerData.hands[0].isDoubled && (<> (D)</>)}</p>
                    <p>{playerData.hands[0].handValue.filter((v: any) => v <= 21).length > 0 ? (
                        <>{playerData.hands[0].handValue.filter((v: any) => v <= 21).join(" / ")}</>
                    ) : (
                        <>{playerData.hands[0].handValue[0]}</>
                    )}</p>
                    <p>{playerData.username}</p>

                    <span className="text-xs font-medium text-center me-2 px-2.5 py-0.5 rounded bg-gray-700 text-indigo-400 border border-indigo-400">
                        {playerData.stack} $
                    </span>

                </div>

                {playerData.hands[0].winAmount !== null && (
                    <HandResultMessage message={winMessageText(playerData.hands[0].winAmount)} color={playerData.hands[0].winAmount >= 0 ? "green" : "red"}></HandResultMessage>
                )}

                <TurnIndicator show={currentPlayer == playerData.identifier && currentHand == 0}></TurnIndicator>
            </div>
        );
    }

    return (
        <div className='flex-1 px-10 py-2 flex flex-col justify-center items-center overflow-visible relative'>
            {playerData.hands.filter((elem: any, idx: any) => idx == currentHand && currentPlayer == playerData.identifier).map((hand: any, idx: number) => (
                <>
                    <PlayerHand hand={hand}></PlayerHand>
                </>
            ))}

            <div className='flex w-full flex-wrap'>
                {playerData.hands.filter((elem: any, idx: any) => idx !== currentHand || currentPlayer != playerData.identifier).map((hand: any, idx: number) => (
                    <>
                        <div className='flex-1 min-w-fit'>
                            <PlayerHand hand={hand} smaller={true}></PlayerHand>
                        </div>
                    </>
                ))}
            </div>

            <div className='flex flex-col'>
                {(currentPlayer == playerData.identifier) && (
                    <p>{playerData.hands[currentHand].handValue.filter((v: any) => v <= 21).length > 0 ? (
                        <>{playerData.hands[currentHand].handValue.filter((v: any) => v <= 21).join(" / ")}</>
                    ) : (
                        <>{playerData.hands[currentHand].handValue[currentHand]}</>
                    )}</p>
                )}

                <p>{playerData.username}</p>

                <span className="text-xs font-medium text-center me-2 px-2.5 py-0.5 rounded bg-gray-700 text-indigo-400 border border-indigo-400">
                    {playerData.stack} $
                </span>
            </div>

            < TurnIndicator show={currentPlayer == playerData.identifier}></TurnIndicator>
        </div >
    )
}
