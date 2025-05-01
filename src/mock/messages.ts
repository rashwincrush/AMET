export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link';
  url: string;
  size?: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

// Current user ID for mock purposes
export const currentUserId = "alumni-001";

// Mock conversations for the current user
export const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    participants: [
      {
        id: "alumni-001",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        id: "alumni-002",
        name: "Priya Patel",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg"
      }
    ],
    lastMessage: {
      content: "I'd be happy to discuss mentorship opportunities with you!",
      timestamp: "2025-04-30T14:30:00Z",
      senderId: "alumni-002"
    },
    unreadCount: 1
  },
  {
    id: "conv-002",
    participants: [
      {
        id: "alumni-001",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        id: "alumni-003",
        name: "Michael Chen",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg"
      }
    ],
    lastMessage: {
      content: "Thanks for sharing that article on machine learning applications!",
      timestamp: "2025-04-29T09:15:00Z",
      senderId: "alumni-001"
    },
    unreadCount: 0
  },
  {
    id: "conv-003",
    participants: [
      {
        id: "alumni-001",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        id: "alumni-005",
        name: "James Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg"
      }
    ],
    lastMessage: {
      content: "Would you be available for a quick call to discuss the UI design for my project?",
      timestamp: "2025-04-28T16:45:00Z",
      senderId: "alumni-005"
    },
    unreadCount: 2
  },
  {
    id: "conv-004",
    participants: [
      {
        id: "alumni-001",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        id: "alumni-004",
        name: "Sarah Williams",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg"
      }
    ],
    lastMessage: {
      content: "I'll see you at the alumni networking event next week!",
      timestamp: "2025-04-27T11:20:00Z",
      senderId: "alumni-004"
    },
    unreadCount: 0
  }
];

// Mock messages for each conversation
export const mockMessages: Record<string, Message[]> = {
  "conv-001": [
    {
      id: "msg-001-1",
      senderId: "alumni-001",
      senderName: "Alex Johnson",
      senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      recipientId: "alumni-002",
      recipientName: "Priya Patel",
      recipientAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      content: "Hi Priya, I noticed you're offering mentorship in marketing strategy. I'm looking to transition into a marketing role and would love some guidance.",
      timestamp: "2025-04-30T14:15:00Z",
      isRead: true
    },
    {
      id: "msg-001-2",
      senderId: "alumni-002",
      senderName: "Priya Patel",
      senderAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "Hi Alex! Great to hear from you. I'd be happy to discuss mentorship opportunities with you!",
      timestamp: "2025-04-30T14:30:00Z",
      isRead: false
    }
  ],
  "conv-002": [
    {
      id: "msg-002-1",
      senderId: "alumni-003",
      senderName: "Michael Chen",
      senderAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "Hey Alex, I came across this interesting article on machine learning applications in software development. Thought you might find it useful!",
      timestamp: "2025-04-29T09:00:00Z",
      isRead: true,
      attachments: [
        {
          id: "att-001",
          name: "ML Applications in Software Dev",
          type: "link",
          url: "https://example.com/ml-applications"
        }
      ]
    },
    {
      id: "msg-002-2",
      senderId: "alumni-001",
      senderName: "Alex Johnson",
      senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      recipientId: "alumni-003",
      recipientName: "Michael Chen",
      recipientAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
      content: "Thanks for sharing that article on machine learning applications!",
      timestamp: "2025-04-29T09:15:00Z",
      isRead: true
    }
  ],
  "conv-003": [
    {
      id: "msg-003-1",
      senderId: "alumni-005",
      senderName: "James Rodriguez",
      senderAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "Hi Alex, I'm working on a new project and could use some advice on the technical implementation.",
      timestamp: "2025-04-28T16:30:00Z",
      isRead: true
    },
    {
      id: "msg-003-2",
      senderId: "alumni-001",
      senderName: "Alex Johnson",
      senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      recipientId: "alumni-005",
      recipientName: "James Rodriguez",
      recipientAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
      content: "Sure, I'd be happy to help. What kind of project are you working on?",
      timestamp: "2025-04-28T16:40:00Z",
      isRead: true
    },
    {
      id: "msg-003-3",
      senderId: "alumni-005",
      senderName: "James Rodriguez",
      senderAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "It's a web application for portfolio management. Would you be available for a quick call to discuss the UI design for my project?",
      timestamp: "2025-04-28T16:45:00Z",
      isRead: false,
      attachments: [
        {
          id: "att-002",
          name: "Portfolio App Mockup",
          type: "image",
          url: "https://via.placeholder.com/800x600",
          size: "1.2 MB"
        }
      ]
    }
  ],
  "conv-004": [
    {
      id: "msg-004-1",
      senderId: "alumni-001",
      senderName: "Alex Johnson",
      senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      recipientId: "alumni-004",
      recipientName: "Sarah Williams",
      recipientAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      content: "Hi Sarah, are you planning to attend the alumni networking event next week?",
      timestamp: "2025-04-27T11:00:00Z",
      isRead: true
    },
    {
      id: "msg-004-2",
      senderId: "alumni-004",
      senderName: "Sarah Williams",
      senderAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "Hi Alex! Yes, I've already registered. Are you going too?",
      timestamp: "2025-04-27T11:10:00Z",
      isRead: true
    },
    {
      id: "msg-004-3",
      senderId: "alumni-001",
      senderName: "Alex Johnson",
      senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      recipientId: "alumni-004",
      recipientName: "Sarah Williams",
      recipientAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      content: "Yes, I just registered. Looking forward to catching up!",
      timestamp: "2025-04-27T11:15:00Z",
      isRead: true
    },
    {
      id: "msg-004-4",
      senderId: "alumni-004",
      senderName: "Sarah Williams",
      senderAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      recipientId: "alumni-001",
      recipientName: "Alex Johnson",
      recipientAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "I'll see you at the alumni networking event next week!",
      timestamp: "2025-04-27T11:20:00Z",
      isRead: true
    }
  ]
};

// Helper function to get conversations for a user
export const getConversationsForUser = (userId: string): Conversation[] => {
  return mockConversations.filter(conv => 
    conv.participants.some(p => p.id === userId)
  );
};

// Helper function to get messages for a conversation
export const getMessagesForConversation = (conversationId: string): Message[] => {
  return mockMessages[conversationId] || [];
};

// Helper function to get a conversation between two users
export const getConversationBetweenUsers = (userId1: string, userId2: string): Conversation | undefined => {
  return mockConversations.find(conv => 
    conv.participants.some(p => p.id === userId1) && 
    conv.participants.some(p => p.id === userId2)
  );
};

// Helper function to create a new message
export const createMessage = (
  senderId: string, 
  recipientId: string, 
  content: string,
  attachments?: Attachment[]
): Message => {
  const sender = mockAlumni.find(a => a.id === senderId);
  const recipient = mockAlumni.find(a => a.id === recipientId);
  
  if (!sender || !recipient) {
    throw new Error('Sender or recipient not found');
  }
  
  return {
    id: `msg-${Date.now()}`,
    senderId,
    senderName: `${sender.firstName} ${sender.lastName}`,
    senderAvatar: sender.avatarUrl,
    recipientId,
    recipientName: `${recipient.firstName} ${recipient.lastName}`,
    recipientAvatar: recipient.avatarUrl,
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
    attachments
  };
};

// Import mock alumni for helper functions
import { mockAlumni } from './alumni';
