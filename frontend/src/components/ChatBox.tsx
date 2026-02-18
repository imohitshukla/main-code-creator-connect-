import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '@/utils/apiHelper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';

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
    brandUserId: number; // User ID of the brand
}

const ChatBox: React.FC<ChatBoxProps> = ({ dealId, currentUserId, creatorId, brandUserId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const receiverId = currentUserId === brandUserId ? creatorId : brandUserId; // Determine who we are talking to.
    // Wait, creatorId is likely profile ID or User ID? 
    // In Deal object: creator_id is Profile ID. brand_id is Profile ID.
    // We need User IDs for chat.
    // dealController getDealById joins tables to get brand_user_id and creator_user_id.
    // So we should pass those.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            // 1. Find or Create Conversation linked to this Deal
            // We need an endpoint for this. 
            // Existing createConversation takes receiverId and campaignId. 
            // We might need to update createConversation or findConversation logic.
            // Let's assume we can resolve conversation by participants + deal_id in the future, 
            // but for now, let's try to get conversation by deal_id if possible, or create one.

            // Actually, let's look at `messagesController.js`. `createConversation` takes `receiverId, campaignId`. 
            // It uses participants to check existence.
            // We probably want to link specific deal chats.

            // Let's use a specialized endpoint if needed or just use the existing one and filter/link.
            // For "Contextual Chat", it's best if we check if a conversation exists for these 2 users AND this deal.
            // Since we added `deal_id` to conversations table, we should use it.

            // Let's call an endpoint to get/create conversation for this deal.
            const res = await apiCall('/api/messages/deal/' + dealId, {
                method: 'POST', // POST to ensure creation if checks fail? Or GET?
                // Let's assume we create a new route: POST /api/messages/init-deal-chat
                body: JSON.stringify({ dealId, receiverId })
            });

            // Wait, I didn't create this route!
            // I only updated `sendMessage` and `getMessages`.
            // I need a way to get the conversation ID for the chat box.

            // Fallback: Use standard conversation creation, but pass dealId.
            // I need to update createConversation controller to accept dealId.
        } catch (error) {
            console.error("Error fetching chat:", error);
        }
    };
    // ...
    // RE-EVALUATION: I need to update createConversation in backend to handle deal_id first.
    // Then I can finish this component.
    return <div>Chat Component Placeholder</div>;
};

export default ChatBox;
