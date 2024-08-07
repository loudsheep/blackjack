'use client';

import { ChatMessage } from '@/types/ChatMessageType';
import React, { useState } from 'react';

type ChatWindowProps = {
    sendMessage: (message: string) => void,
    currentUserIdentifier: string,
    lastMessages: ChatMessage[],
};

export default function ChatWindow(props: ChatWindowProps) {
    const [message, setMessage] = useState<string>("");

    const handleSend = (e: any) => {
        e.preventDefault();

        props.sendMessage(message);
        setMessage("");
    };

    return (
        <div className='fixed top-0 left-0 w-64 text-white'>
            <form className='flex' onSubmit={handleSend}>
                <input type="text" name="" id="" value={message} onChange={(e) => setMessage(e.target.value)} className='w-3/4 bg-opacity-100 text-black' placeholder='Write a message' maxLength={50} />
                <button>Send</button>
            </form>

            <div className='flex flex-col-reverse'>
                {props.lastMessages.map((message, idx) => (
                    <div className='flex' key={idx}>
                        {message.author == props.currentUserIdentifier ? (
                            <span className='text-green-600 mr-2'>You:</span>
                        ) : (
                            <span className='text-yellow-500 mr-2'>{message.authorName}:</span>
                        )}
                        <span>{message.message}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
