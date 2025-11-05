import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ChatComponent } from '../components/ChatComponent';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Conversation {
  id: number;
  participants: number[];
  other_participant: number;
  last_message?: string;
  last_message_time?: string;
}

const Messages: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data: conversations, isLoading, error } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      return data.conversations;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading conversations...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error loading conversations: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="flex gap-4">
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={selectedConversationId === conv.id.toString() ? 'default' : 'ghost'}
                  className="w-full mb-2 justify-start"
                  onClick={() => setSelectedConversationId(conv.id.toString())}
                >
                  Conversation with User {conv.other_participant}
                  {conv.last_message && (
                    <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                  )}
                </Button>
              ))
            ) : (
              <p>No conversations yet.</p>
            )}
          </CardContent>
        </Card>
        <div className="w-2/3">
          {selectedConversationId && (
            <ChatComponent conversationId={selectedConversationId} />
          )}
          {!selectedConversationId && (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                Select a conversation to start chatting.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
