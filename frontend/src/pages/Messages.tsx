import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ChatComponent } from '../components/ChatComponent';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

interface Conversation {
  id: number;
  participants: number[];
  other_participant: number;
  last_message?: string;
  last_message_time?: string;
  brand_name?: string;
  brand_avatar?: string;
  campaign_title?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations, isLoading, error } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/messages/conversations`, {
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
    enabled: !!user,
  });

  const fallbackConversations: Conversation[] = [
    {
      id: 101,
      participants: [],
      other_participant: 5001,
      brand_name: 'Aurora Activewear',
      campaign_title: 'Spring Launch',
      last_message: 'We love your style—can we schedule a kickoff call next week?',
      last_message_time: new Date().toISOString(),
    },
    {
      id: 102,
      participants: [],
      other_participant: 5002,
      brand_name: 'Glow Labs Beauty',
      campaign_title: 'Glow Serum Promo',
      last_message: 'Sharing the brief + mood board here. Let us know your thoughts!',
      last_message_time: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: 103,
      participants: [],
      other_participant: 5003,
      brand_name: 'VeloTech Bikes',
      campaign_title: 'City Ride Series',
      last_message: 'Quick reminder: deliverable deadline is Friday. Need anything?',
      last_message_time: new Date(Date.now() - 7200 * 1000).toISOString(),
    },
  ];

  const activeConversations = (conversations && conversations.length > 0 ? conversations : fallbackConversations);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return activeConversations;
    return activeConversations.filter((conv) => {
      const title = conv.brand_name || `Brand ${conv.other_participant}`;
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [activeConversations, searchTerm]);

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const getConversationTitle = (conv: Conversation) => conv.brand_name || `Brand ${conv.other_participant}`;

  if (!user) {
    return (
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Please log in to view and respond to brand messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Inbox</p>
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex flex-col md:flex-row bg-card/80 border rounded-2xl shadow-soft overflow-hidden min-h-[600px]">
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r bg-muted/20">
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search brands or messages"
                  className="pl-9"
                />
              </div>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredConversations.map((conv) => {
                  const isActive = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-primary/40 ${
                        isActive ? 'border-primary bg-primary/5' : 'border-transparent bg-card'
                      }`}
                      onClick={() => selectConversation(conv)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{getConversationTitle(conv)}</p>
                        {conv.campaign_title && (
                          <Badge variant="secondary" className="text-xs">
                            {conv.campaign_title}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conv.last_message_time
                          ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {conv.last_message || 'Tap to start the conversation'}
                      </p>
                    </button>
                  );
                })}
                {filteredConversations.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-10 border rounded-xl bg-card">
                    No conversations match that search.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[400px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                <p>Unable to load conversations.</p>
                <p className="text-sm">{error.message}</p>
              </div>
            ) : selectedConversation ? (
              <ChatComponent
                conversationId={selectedConversation.id.toString()}
                participantName={getConversationTitle(selectedConversation)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 text-center p-8">
                <MessageCircle className="h-10 w-10" />
                <div>
                  <p className="text-lg font-semibold">Select a conversation</p>
                  <p className="text-sm">Choose a brand on the left to view the chat history.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
