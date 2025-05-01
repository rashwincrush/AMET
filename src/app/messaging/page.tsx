'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mockConversations, currentUserId } from '@/mock';

type Conversation = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_time: string;
  participant_name: string;
  participant_avatar: string;
  unread_count: number;
  last_message_preview: string;
};

export default function MessagingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError(null);

        // Use mock conversations data
        const formattedConversations: Conversation[] = mockConversations.map(conv => {
          // Find the other participant (not the current user)
          const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
          
          if (!otherParticipant) {
            throw new Error('Conversation participant not found');
          }
          
          return {
            id: conv.id,
            participant1_id: currentUserId,
            participant2_id: otherParticipant.id,
            last_message_time: conv.lastMessage.timestamp,
            participant_name: otherParticipant.name,
            participant_avatar: otherParticipant.avatar || '',
            unread_count: conv.unreadCount,
            last_message_preview: conv.lastMessage.content.substring(0, 50)
          };
        });

        setConversations(formattedConversations);
      } catch (err: any) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [user]);

  const filteredConversations = conversations.filter(conversation => 
    conversation.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/messaging/new')}>
              New Message
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full p-3 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No conversations found</p>
            <Button onClick={() => router.push('/messaging/new')}>
              Start a new conversation
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link href={`/messaging/${conversation.id}`}>
                    <div className={`flex items-center p-4 hover:bg-gray-50 ${conversation.unread_count > 0 ? 'bg-blue-50' : ''}`}>
                      <div className="flex-shrink-0 mr-4">
                        {conversation.participant_avatar ? (
                          <img 
                            src={conversation.participant_avatar} 
                            alt={conversation.participant_name} 
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xl font-medium text-gray-600">
                              {conversation.participant_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <h3 className={`text-sm font-medium ${conversation.unread_count > 0 ? 'text-blue-800 font-bold' : 'text-gray-900'}`}>
                            {conversation.participant_name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message_preview}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="ml-3">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}