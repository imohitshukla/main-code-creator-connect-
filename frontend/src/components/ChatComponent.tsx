import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
}

interface ChatComponentProps {
  conversationId: string;
  participantName?: string;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ conversationId, participantName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conversationId, content: newMessage }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Messaging</p>
          <h2 className="text-lg font-semibold">{participantName || 'Conversation'}</h2>
          <p className="text-xs text-muted-foreground">{messages.length} message{messages.length === 1 ? '' : 's'} • secure chat</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessages} disabled={isLoading}>
          Refresh
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4 bg-gradient-to-b from-muted/30 to-transparent">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Loading chat…</div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-white text-foreground rounded-bl-none border'
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1 text-primary/80">{msg.sender_name}</p>
                  )}
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <span className="text-[11px] opacity-70 block mt-1 text-right">
                    {formatTimestamp(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t px-4 lg:px-6 py-3 flex gap-3">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={handleKeyDown}
        />
        <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};
