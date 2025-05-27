"use client";

import CommonLayout from "./CommonLayout";

export default function GameAlreadyStarted() {
    return (
        <CommonLayout>
            <h1 className='mt-10 text-2xl font-bold'>Looks like the game has already started without you!</h1>
            <h2 className='mb-10'>Wait until game admin pauses the game and try again, or create your own game</h2>

            <div className="flex gap-5">
                <button
                    onClick={() => window.location.reload()}
                    className="relative bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
                    style={{ border: '2px solid #003366' }}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-xl">&#128472;</span>
                        <span>Refresh page</span>
                    </div>
                </button>

                <a href="/create">
                    <button
                        className="relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
                        style={{ border: '2px solid #440000' }}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-xl">&#127183;</span>
                            <span>Create a new game</span>
                        </div>
                    </button>
                </a>
            </div>
        </CommonLayout>
    )
}
