import React from 'react'

type PlayerActionsProps = {
    actions: string[],
    actionCallback: (action: string) => void,
};

const styles = [
    "from-green-700 to-green-800 hover:from-green-800 hover:to-green-900",
    "from-red-700 to-red-800 hover:from-red-800 hover:to-red-900",
    "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    "from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900",
];

export default function PlayerActions({ actions, actionCallback }: PlayerActionsProps) {
    return (
        <div className='flex absolute w-[100vw] bottom-0 justify-center z-50'>
            <div className='flex flex-col h-36 w-full md:w-3/4 lg:w-3/5 xl:w-1/2 bg-black bg-opacity-30 border-2 border-black rounded-lg text-white p-1'>
                <div className='flex-[1]'>
                    Take Action:
                </div>

                <div className='flex flex-[2] justify-center flex-wrap'>
                    {actions.map((value, idx) => (
                        <button className={'flex-1 relative bg-gradient-to-b text-white font-bold py-1.5 px-4 rounded-md shadow-md transition-all duration-300 uppercase ' + styles[idx]} style={{ border: '2px solid #440000' }} onClick={() => actionCallback(value)}>
                            {value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
