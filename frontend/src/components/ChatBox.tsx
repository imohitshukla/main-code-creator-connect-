import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '@/utils/apiHelper';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    sender_id: number;
    sender_name: string;
    created_at: string;
}

interface ChatBoxProps {
    dealId: number;
    currentUserId: number;
    creatorId: number;
    brandUserId: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ dealId, currentUserId, creatorId, brandUserId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await apiCall(`/api/messages/deal/${dealId}`) as any;
            if (res.conversation) {
                setConversationId(res.conversation.id);
            }
            if (res.messages) {
                setMessages(res.messages);
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isTabActive = !document.hidden;

        // Fetch immediately on mount
        fetchMessages();

        // Setup polling interval that only fires if tab is active
        const intervalId = setInterval(() => {
            if (!document.hidden) {
                fetchMessages();
            }
        }, 5000); // Poll every 5 seconds

        // Add event listener to fetch immediately when user focuses the tab again
        const handleVisibilityChange = () => {
            if (!document.hidden && !isTabActive) {
                fetchMessages();
            }
            isTabActive = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dealId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await apiCall('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    content: newMessage.trim(),
                    dealId: dealId,
                    conversationId: conversationId
                })
            });
            setNewMessage('');
            fetchMessages(); // refresh immediately
        } catch (error: any) {
            console.error("Failed to send message:", error);
            alert(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading && messages.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[500px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Project Chat</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSender = String(msg.sender_id) === String(currentUserId);

                        return (
                            <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${isSender
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    {!isSender && (
                                        <p className="text-xs font-semibold mb-1 text-gray-500">
                                            {msg.sender_name?.split('@')[0] || 'User'}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isSender ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
