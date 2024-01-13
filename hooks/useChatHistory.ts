import { ChatMessage } from '@/types/ChatMessageType';
import { useState, Dispatch, SetStateAction } from 'react';

type UseChatHistoryReturnType = [ChatMessage[], Dispatch<SetStateAction<ChatMessage[]>>, (message: ChatMessage) => void];

function useChatHistory(): UseChatHistoryReturnType {
    const [history, setHistory] = useState<ChatMessage[]>([]);

    const addToHistory = (message: ChatMessage) => {
        setHistory([...history, message]);
    };

    return [history, setHistory, addToHistory];
}

export default useChatHistory;