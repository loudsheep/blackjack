"use client";

import React, { useState } from 'react'
import Card from '../Card';
import HandResultMessage from './HandResultMessage';

type PlayerHandProps = {
    hand: any,
    smaller?: boolean,
};

export default function PlayerHand({ hand, smaller }: PlayerHandProps) {
    const [translate, setTranslate] = useState<number>(smaller ? 7 : 20);

    return (
        <div className={'flex justify-center items-center ' + (smaller ? "h-[7vh]" : "h-[20vh]")}>
            {hand.cards.map((card: any, idx: number) => (
                <div className={'absolute  ' + (smaller ? "h-[7vh]" : "h-[20vh]")} style={{ translate: (idx * translate) + "px " + (-idx * translate) + "px", rotate: (hand.isDoubled && (idx == hand.cards.length - 1)) ? "90deg" : "0deg" }}>
                    <Card key={idx} suit={card.suit} value={card.value} className='h-full'></Card>
                </div>
            ))}

            {(hand.winAmount !== null && smaller) && (
                <HandResultMessage message={hand.winAmount + "$"} color={hand.winAmount >= 0 ? "green" : "red"} smaller={true}></HandResultMessage>
            )}
        </div>
    )
}
