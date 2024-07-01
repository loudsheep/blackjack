"use client";

import React, { useEffect, useRef, useState } from 'react'

type ActionTimerProps = {
    maxTimeMs: number,
    countUntil: number,
    countName?: string,
};

export default function ActionTimer({ maxTimeMs, countUntil, countName }: ActionTimerProps) {
    const [timeoutId, setTimeoutId] = useState<any>();
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (timeoutId) {
            clearInterval(timeoutId);
            setTimeoutId(null);
        }

        if (countUntil > Date.now()) {
            setTimeoutId(setInterval(() => {
                let left = countUntil - Date.now();
                setTimeLeft(left);

                if (left <= 0) {
                    clearInterval(timeoutId);
                    setTimeoutId(null);
                }
            }, 10));
        }
    }, [countUntil]);

    return (
        <div className='fixed left-0 top-0 flex flex-col h-[100vh] justify-center text-white'>
            <div className='flex flex-col w-20 bg-black bg-opacity-20 border-2 border-gray-900 rounded-md items-center py-3'>
                <p>
                    Time left
                </p>
                <p>
                    {countName}
                </p>

                <div className="flex flex-col flex-nowrap justify-end w-4 h-48 bg-gray-800 rounded-full overflow-hidden">
                    <div className="rounded-full overflow-hidden bg-yellow-600" style={{ height: (timeLeft / maxTimeMs * 100 ) + "%" }}></div>
                </div>

                {Math.ceil(timeLeft / 1000)}s
            </div>
        </div>
    )
}
