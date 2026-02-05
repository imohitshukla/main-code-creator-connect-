import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/utils';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  content: string;
  is_system_message: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Conversation {
  id: number;
  participant_1_id: number;
  participant_2_id: number;
  deal_id: number | null;
  last_message_at: string;
  participant1: {
    id: number;
    name: string;
    email: string;
  };
  participant2: {
    id: number;
    name: string;
    email: string;
  };
  deal?: {
    id: number;
    title: string;
    current_stage: string;
  };
}

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const userId = 1; // TODO: Get from auth context

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/messages/conversations`);
      if (!res.ok) throw new Error('Failed to load conversations');
      return res.json() as Promise<{ conversations: Conversation[] }>;
    },
    refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return { messages: [] };
      const res = await fetch(`${getApiUrl()}/api/messages/conversation/${selectedConversation}`);
      if (!res.ok) throw new Error('Failed to load messages');
      return res.json() as Promise<{ messages: Message[] }>;
    },
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${getApiUrl()}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          senderId: userId,
          content
        })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messagesData?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      sendMessageMutation.mutate(message);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant_1_id === userId 
      ? conversation.participant2 
      : conversation.participant1;
  };

  if (conversationsLoading) {
    return <div className="p-10 text-center">Loading conversations...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {conversations?.conversations?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations?.conversations?.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = conversation.id === selectedConversation;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {otherParticipant?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherParticipant?.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                        
                        {conversation.deal && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            📋 {conversation.deal.title}
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600 truncate">
                          Last message at {formatTime(conversation.last_message_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getOtherParticipant(
                        conversations?.conversations?.find(c => c.id === selectedConversation) || {} as Conversation
                      )?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherParticipant(
                          conversations?.conversations?.find(c => c.id === selectedConversation) || {} as Conversation
                        )?.name}
                      </h3>
                      {conversations?.conversations?.find(c => c.id === selectedConversation)?.deal && (
                        <div className="text-xs text-blue-600">
                          Deal: {conversations.conversations.find(c => c.id === selectedConversation)?.deal?.title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center">Loading messages...</div>
                ) : (
                  messagesData?.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.is_system_message ? (
                        /* System Message - Centered, Gray, Italic */
                        <div className="text-center my-4">
                          <div className="inline-block bg-gray-100 text-gray-600 text-sm italic px-4 py-2 rounded-lg">
                            {msg.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      ) : msg.sender_id === userId ? (
                        /* My Message - Right, Blue */
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
                            {msg.content}
                          </div>
                          <div className="text-xs text-blue-600 mt-1 text-right">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      ) : (
                        /* Their Message - Left, Gray */
                        <div className="max-w-xs lg:max-w-md">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {msg.sender?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {msg.sender?.name}
                            </span>
                          </div>
                          <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                            {msg.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
