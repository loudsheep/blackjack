import { ChatMessage } from '@/types/ChatMessageType';
import { useState, Dispatch, SetStateAction } from 'react';

const useChatHistory = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const addMessage = (newMessage: ChatMessage) => {
        setChatHistory(prevChatHistory => {
            const updatedChatHistory = [...prevChatHistory, newMessage];
            if (updatedChatHistory.length > 5) {
                updatedChatHistory.shift(); // Remove the oldest message
            }
            return updatedChatHistory;
        });
    };

    const clearChat = () => {
        setChatHistory([]);
    };

    return {
        chatHistory,
        addMessage,
        clearChat,
    };
};

export default useChatHistory;