import React from 'react';
import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Blackjack!',
    description: 'Create new blackjack game!',
}

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-green-500 h-screen flex flex-col items-center justify-start">
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url(/bg.png)', opacity: '0.1', zIndex: '2' }}
            ></div>
            <nav className="bg-green-800 w-full p-4 flex justify-between items-center" style={{ zIndex: '3' }}>
                <div className="text-white text-2xl font-bold">Your Blackjack Game</div>
                <div className="flex space-x-4">
                    <a href="/about" className="text-white">About</a>
                    <a href="https://github.com/your-github-repo" className="text-white">GitHub</a>
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center text-white w-full">
                <div style={{ zIndex: '3' }} className='flex flex-col items-center justify-center text-white w-full'>
                    {children}
                </div>
            </div>
        </div>
    )
}
