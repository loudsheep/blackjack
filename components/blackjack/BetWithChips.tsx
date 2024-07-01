"use client";

import React, { useState } from 'react'

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
            <div className='flex absolute w-[100vw] bottom-36 justify-center z-50'>
                <div className='flex h-24 w-1/2 text-white p-1' style={{ background: "radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)" }}>
                    <div className='flex-[1] md:flex-[2] lg:flex-[3] xl:flex-[5] 2xl:flex-[6] flex flex-col'>
                        <div className='flex-[1] w-full text-center'>
                            Your bet: {userStack - temporaryUserStack}$
                        </div>

                        <div className='flex-[2] flex'>
                            <div className='flex flex-[2] justify-center'>
                                {selectedChips.map((value) => (
                                    <div className='h-5/6 aspect-square rounded-full flex justify-center items-center text-xl mr-1 bg-red-500 cursor-pointer' onClick={() => handleChipRemove(value)}>
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex-[1] flex flex-col justify-between'>
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
                <div className='flex flex-col h-36 w-full md:w-3/4 lg:w-3/5 xl:w-1/2 bg-black bg-opacity-30 border-2 border-black rounded-lg text-white p-1'>
                    <div className='flex-[1]'>
                        Your stack: {temporaryUserStack}$
                    </div>

                    <div className='flex flex-[2] justify-center flex-wrap'>
                        {availableChips.map((value) => (
                            <div className={'h-2/5 sm:h-3/5 lg:h-3/4 2xl:h-5/6 aspect-square rounded-full flex justify-center items-center text-xl mx-1 ' + (value <= temporaryUserStack ? "bg-red-500 cursor-pointer" : "bg-gray-500 cursor-not-allowed")} onClick={() => handleChipAdd(value)}>
                                {value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
