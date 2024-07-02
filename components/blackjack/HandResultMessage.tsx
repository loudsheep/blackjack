import React from 'react'

type HandResultMessageProps = {
    message: string,
    color: "green" | "red",
    smaller?: boolean,
};

export default function HandResultMessage({ message, color, smaller }: HandResultMessageProps) {
    if (color == "red") {
        return (
            // <div className='absolute flex justify-center items-center'>
                <div className={"z-50 text-center p-2 mb-4 text-white font-bold rounded-lg bg-red-800 bg-opacity-80 border-2 border-red-500 " + (smaller ? "w-full text-sm mx-auto" : "w-1/2 text-lg absolute")}>
                    {message}
                </div>
            // </div>
        )
    }

    return (
        // <div className='absolute flex justify-center items-center'>
            <div className={"z-50 text-center p-2 mb-4 text-white font-bold rounded-lg bg-green-800 bg-opacity-80 border-2 border-green-500 " + (smaller ? "w-full text-sm mx-auto" : "w-1/2 text-lg absolute")}>
                {message}
            </div>
        // </div>
    )
}
