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
    title: "AMET Maritime Alumni Reunion 2025",
    description: "Join us for our annual maritime alumni reunion! Connect with fellow marine engineers, naval architects, and maritime professionals. The event includes industry panels, networking sessions, and a tour of our new marine simulation center.",
    date: "2025-06-15",
    time: "10:00 AM - 5:00 PM",
    location: "AMET University Main Campus, Maritime Auditorium",
    organizer: "AMET Alumni Association - Maritime Division",
    image: "https://images.unsplash.com/photo-1566902249079-7c61ca8de6dd?q=80&w=2070&auto=format&fit=crop",
    category: "Maritime Networking",
    attendees: 250,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "https://ametalumni.in/events/maritime-reunion-2025",
    tags: ["Maritime", "Reunion", "Networking", "Marine Engineering"]
  },
  {
    id: "event-002",
    title: "Maritime Industry Career Workshop",
    description: "A specialized workshop for maritime professionals focusing on career advancement in shipping, port management, and naval sectors. Learn about international certification requirements, leadership opportunities in maritime operations, and emerging trends in the shipping industry.",
    date: "2025-07-10",
    time: "2:00 PM - 5:00 PM",
    location: "Virtual Event",
    organizer: "AMET Maritime Career Services",
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=2070&auto=format&fit=crop",
    category: "Maritime Career",
    attendees: 120,
    isVirtual: true,
    virtualLink: "https://ametalumni.in/virtual-events/maritime-career-workshop",
    registrationRequired: true,
    registrationLink: "https://ametalumni.in/events/maritime-career-workshop-registration",
    tags: ["Maritime Career", "Shipping Industry", "Professional Development", "Naval Certification"]
  },
  {
    id: "event-003",
    title: "Marine Technology Innovation Summit",
    description: "A comprehensive summit focused on technological advancements in the maritime industry. Features presentations on autonomous vessels, maritime cybersecurity, advanced navigation systems, and sustainable marine technologies. Connect with leading marine technology companies and research institutions.",
    date: "2025-08-05",
    time: "9:00 AM - 4:00 PM",
    location: "AMET Marine Technology Center, Chennai",
    organizer: "AMET Advanced Computing & Maritime Technology Division",
    image: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?q=80&w=2070&auto=format&fit=crop",
    category: "Maritime Technology",
    attendees: 180,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "https://ametalumni.in/events/marine-tech-summit-registration",
    tags: ["Marine Technology", "Maritime Innovation", "Naval Engineering", "Autonomous Vessels"]
  },
  {
    id: "event-004",
    title: "Shipping Management Networking Event",
    description: "A specialized networking event for alumni in shipping management, port operations, and maritime logistics. Connect with industry leaders from major shipping companies, port authorities, and maritime logistics firms. Discuss current challenges and opportunities in global shipping and supply chain management.",
    date: "2025-09-20",
    time: "6:00 PM - 9:00 PM",
    location: "Chennai Port Trust Conference Center",
    organizer: "AMET Shipping Management Department",
    image: "https://images.unsplash.com/photo-1577542756049-2e2d3d0d5be9?q=80&w=2069&auto=format&fit=crop",
    category: "Maritime Management",
    attendees: 75,
    isVirtual: false,
    registrationRequired: true,
    registrationLink: "https://ametalumni.in/events/shipping-management-networking",
    tags: ["Shipping Management", "Maritime Logistics", "Port Operations", "Supply Chain"]
  }
];
