"use client";

import React, { useState } from 'react'

type BetFormProps = {
    minValue: number,
    maxValue: number,
    startValue: number,
    step: number,
    confirmButtonText: string,
    callback: (value: number) => void,
    className?: string,
};

export default function BetForm(props: BetFormProps) {
    const [value, setValue] = useState<number>(props.startValue);

    return (
        <div className={"relative z-[100] " + props.className}>
            <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-white">Place a bet - {value}$</label>

            <input id="steps-range" type="range" min={props.minValue} max={props.maxValue} value={value} step={props.step} className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm" onChange={(e) => setValue(Number.parseInt(e.target.value))} />

            <button className="relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300" style={{ border: '2px solid #440000' }} onClick={() => props.callback(value)}>{props.confirmButtonText}</button>
        </div>
    )
}
