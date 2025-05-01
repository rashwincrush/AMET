export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  image: string;
  category: string;
  attendees?: number;
  isVirtual: boolean;
  virtualLink?: string;
  registrationRequired: boolean;
  registrationLink?: string;
  tags: string[];
}

export const mockEvents: Event[] = [
  {
    id: "event-001",
    title: "Annual Alumni Reunion 2025",
    description: "Join us for our annual alumni reunion event! Connect with old classmates, network with professionals, and enjoy a day of fun activities and inspiring talks.",
    date: "2025-06-15",
    time: "10:00 AM - 5:00 PM",
    location: "University Main Campus, Auditorium Hall",
    organizer: "Alumni Association",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    category: "Networking",
    attendees: 250,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "/events/register/event-001",
    tags: ["reunion", "networking", "annual"]
  },
  {
    id: "event-002",
    title: "Tech Industry Career Panel",
    description: "Hear from alumni working at top tech companies about their career journeys, industry insights, and advice for breaking into the tech industry.",
    date: "2025-05-20",
    time: "6:00 PM - 8:00 PM",
    location: "Virtual Event",
    organizer: "Computer Science Department",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=2070&auto=format&fit=crop",
    category: "Career",
    attendees: 120,
    isVirtual: true,
    virtualLink: "https://zoom.us/j/123456789",
    registrationRequired: true,
    registrationLink: "/events/register/event-002",
    tags: ["tech", "career", "panel"]
  },
  {
    id: "event-003",
    title: "Entrepreneurship Workshop",
    description: "Learn the fundamentals of starting your own business from successful alumni entrepreneurs. Topics include funding, business planning, and market analysis.",
    date: "2025-07-10",
    time: "9:00 AM - 4:00 PM",
    location: "Business School, Room 302",
    organizer: "Entrepreneurship Center",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    category: "Workshop",
    attendees: 75,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "/events/register/event-003",
    tags: ["entrepreneurship", "business", "workshop"]
  },
  {
    id: "event-004",
    title: "Alumni Networking Mixer",
    description: "An evening of casual networking with fellow alumni across various industries. Light refreshments and drinks will be provided.",
    date: "2025-05-30",
    time: "7:00 PM - 10:00 PM",
    location: "Downtown Lounge, 123 Main Street",
    organizer: "Alumni Relations Office",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
    category: "Networking",
    attendees: 100,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "/events/register/event-004",
    tags: ["networking", "social", "mixer"]
  },
  {
    id: "event-005",
    title: "Healthcare Innovation Symposium",
    description: "A day-long symposium featuring alumni working in healthcare innovation. Presentations on the latest advancements in medical technology and healthcare delivery.",
    date: "2025-08-05",
    time: "8:30 AM - 4:30 PM",
    location: "Medical School Auditorium",
    organizer: "Healthcare Innovation Center",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    category: "Symposium",
    attendees: 180,
    isVirtual: true,
    virtualLink: "https://zoom.us/j/987654321",
    registrationRequired: true,
    registrationLink: "/events/register/event-005",
    tags: ["healthcare", "innovation", "symposium"]
  },
  {
    id: "event-006",
    title: "Alumni Volunteer Day",
    description: "Give back to the community by participating in our annual volunteer day. Activities include park clean-up, food bank assistance, and mentoring local students.",
    date: "2025-09-12",
    time: "9:00 AM - 2:00 PM",
    location: "Various Locations",
    organizer: "Community Service Office",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop",
    category: "Community Service",
    attendees: 150,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "/events/register/event-006",
    tags: ["volunteer", "community", "service"]
  }
];
