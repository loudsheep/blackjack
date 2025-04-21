"use client";

import React, { useState } from 'react'
import pokerChipSvg from "../../public/poker_chip_icon.svg";
import Image from 'next/image';
import ChipIcon from './ChipIcon';

const availableChips = [1, 2, 5, 10, 50, 100, 500, 1000];

const reduceChips = (chips: number[]) => {
    let sum = 0;
    chips.forEach(element => {
        sum += element;
    });
    let reduced: number[] = [];
    for (let i = availableChips.length - 1; i >= 0;) {
        const element = availableChips[i];

        if (sum >= element) {
            reduced.push(element);
            sum -= element;
        } else {
            i -= 1;
        }
    }
    return reduced;
};

const removeFirst = (array: number[], element: number) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == element) {
            array.splice(i, 1);
            return array;
        }
    }
    return array;
};

type BetWithChipsProps = {
    userStack: number,
    placeBetCallback: (amount: number) => void,
};

export default function BetWithChips({ userStack, placeBetCallback }: BetWithChipsProps) {
    const [temporaryUserStack, setTemporaryUserStack] = useState(userStack);
    const [selectedChips, setSelectedChips] = useState<number[]>([]);

    const handleChipAdd = (chipValue: number) => {
        if (chipValue > temporaryUserStack) return;
        if (!availableChips.includes(chipValue)) return;

        setSelectedChips(reduceChips([...selectedChips, chipValue]));
        setTemporaryUserStack(temporaryUserStack - chipValue);
    };

    const handleChipRemove = (chipValue: number) => {
        if (!selectedChips.includes(chipValue)) return;

        setTemporaryUserStack(temporaryUserStack + chipValue);
        setSelectedChips(removeFirst(selectedChips, chipValue));
    };

    const handleClear = () => {
        let sum = 0;
        selectedChips.forEach(element => {
            sum += element;
        });
        setTemporaryUserStack(temporaryUserStack + sum);
        setSelectedChips([]);
    };

    const handleConfirmBet = () => {
        let sum = 0;
        selectedChips.forEach(element => {
            sum += element;
        });

        placeBetCallback(sum);
        setSelectedChips([]);
    };

    return (
        <>
            <div className='flex absolute w-[100vw] bottom-64 md:bottom-36 justify-center z-50'>
                <div className='flex h-48 md:h-24 w-full md:w-1/2 text-white p-1 flex-col md:flex-row border-t-2 md:border-none' style={{ background: "radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)" }}>
                    <div className='flex-[3] md:flex-[2] lg:flex-[3] xl:flex-[5] 2xl:flex-[6] flex flex-col'>
                        <div className='flex-[1] w-full text-center'>
                            Your bet: {userStack - temporaryUserStack}$
                        </div>

                        <div className='flex-[2] flex'>
                            <div className='flex flex-[2] justify-center'>
                                {selectedChips.map((value, idx) => (
                                    <ChipIcon value={value} key={idx} onClickElem={handleChipRemove} small={true}></ChipIcon>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex-[1] flex justify-between flex-row md:flex-col'>
                        <button className='w-full relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-1.5 px-4 rounded-md shadow-md transition-all duration-300' style={{ border: '2px solid #440000' }} onClick={handleConfirmBet}>
                            Place Bet
                        </button>
                        <button className='w-full relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-1.5 px-4 rounded-md shadow-md transition-all duration-300' style={{ border: '2px solid #440000' }} onClick={handleClear}>
                            Clear Bet
                        </button>
                    </div>
                </div>
            </div>

            <div className='flex absolute w-[100vw] bottom-0 justify-center z-50'>
                <div className='flex flex-col h-64 md:h-36 w-full md:w-3/4 lg:w-3/5 xl:w-1/2 bg-black bg-opacity-30 border-2 border-black rounded-lg text-white p-1'>
                    <div className='mb-5'>
                        Your stack: {temporaryUserStack}$
                    </div>

                    <div className='flex justify-center flex-wrap'>
                        {availableChips.map((value, idx) => (
                            <ChipIcon value={value} key={idx} disabled={value > temporaryUserStack} onClickElem={handleChipAdd}></ChipIcon>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
