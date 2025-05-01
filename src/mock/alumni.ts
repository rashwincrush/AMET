export interface AlumniProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  graduationYear: string;
  degree: string;
  major: string;
  currentPosition: string;
  company: string;
  location: string;
  bio: string;
  skills: string[];
  interests: string[];
  avatarUrl?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  mentorshipStatus: 'mentor' | 'mentee' | 'both' | 'none';
  mentorshipAreas?: string[];
  isAvailableForRecruitment: boolean;
  isVerified: boolean;
  joinedDate: string;
}

export const mockAlumni: AlumniProfile[] = [
  {
    id: "alumni-001",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phoneNumber: "+1 555-123-4567",
    graduationYear: "2018",
    degree: "Bachelor of Science",
    major: "Computer Science",
    currentPosition: "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    bio: "Passionate software engineer with expertise in full-stack development. Specializing in React, Node.js, and cloud technologies. Always looking to connect with fellow alumni in the tech industry.",
    skills: ["JavaScript", "React", "Node.js", "AWS", "Python"],
    interests: ["Machine Learning", "Open Source", "Hiking", "Photography"],
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexjohnson",
      twitter: "https://twitter.com/alexj",
      github: "https://github.com/alexj",
      website: "https://alexjohnson.dev"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Software Development", "Career Transitions", "Tech Interviews"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2022-03-15"
  },
  {
    id: "alumni-002",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@example.com",
    phoneNumber: "+1 555-987-6543",
    graduationYear: "2020",
    degree: "Master of Business Administration",
    major: "Marketing",
    currentPosition: "Marketing Director",
    company: "Global Brands Ltd.",
    location: "New York, NY",
    bio: "Marketing professional with a passion for digital strategy and brand development. MBA graduate with experience in both B2B and B2C marketing campaigns. Interested in connecting with fellow alumni in marketing and business development.",
    skills: ["Digital Marketing", "Brand Strategy", "Social Media", "Market Research", "Analytics"],
    interests: ["Travel", "Yoga", "Reading", "Cooking"],
    avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/priyapatel",
      twitter: "https://twitter.com/priyap"
    },
    mentorshipStatus: "both",
    mentorshipAreas: ["Marketing Strategy", "Personal Branding"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2021-09-10"
  },
  {
    id: "alumni-003",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@example.com",
    phoneNumber: "+1 555-456-7890",
    graduationYear: "2019",
    degree: "Master of Science",
    major: "Data Science",
    currentPosition: "Data Scientist",
    company: "AnalyticsPro",
    location: "Boston, MA",
    bio: "Data scientist with expertise in machine learning and predictive modeling. Passionate about using data to solve real-world problems. Looking to connect with alumni interested in data science and AI.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Visualization"],
    interests: ["AI Ethics", "Basketball", "Chess", "Science Fiction"],
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/michaelchen",
      github: "https://github.com/mchen",
      website: "https://michaelchen.io"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Data Science", "Machine Learning", "Career Transitions"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2020-05-22"
  },
  {
    id: "alumni-004",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    phoneNumber: "+1 555-789-0123",
    graduationYear: "2015",
    degree: "Bachelor of Arts",
    major: "Psychology",
    currentPosition: "HR Manager",
    company: "Innovative Solutions Inc.",
    location: "Chicago, IL",
    bio: "Human resources professional with a background in psychology. Passionate about creating positive workplace cultures and employee development programs. Interested in connecting with alumni in HR and organizational psychology.",
    skills: ["Recruitment", "Employee Relations", "Training & Development", "Conflict Resolution", "Performance Management"],
    interests: ["Mindfulness", "Running", "Volunteering", "Psychology Research"],
    avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/sarahwilliams"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["HR Career Paths", "Workplace Culture", "Leadership Development"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2019-11-05"
  },
  {
    id: "alumni-005",
    firstName: "James",
    lastName: "Rodriguez",
    email: "james.rodriguez@example.com",
    phoneNumber: "+1 555-234-5678",
    graduationYear: "2022",
    degree: "Bachelor of Fine Arts",
    major: "Graphic Design",
    currentPosition: "UI/UX Designer",
    company: "Creative Digital Agency",
    location: "Los Angeles, CA",
    bio: "Recent graduate with a passion for user-centered design. Currently working as a UI/UX designer at a digital agency. Looking to connect with alumni in design and creative fields.",
    skills: ["UI Design", "UX Research", "Figma", "Adobe Creative Suite", "Prototyping"],
    interests: ["Art Exhibitions", "Photography", "Surfing", "Typography"],
    avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/jamesrodriguez",
      website: "https://jamesrodriguez.design"
    },
    mentorshipStatus: "mentee",
    mentorshipAreas: ["Design Career Growth", "Portfolio Development"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2023-01-20"
  },
  {
    id: "alumni-006",
    firstName: "Emily",
    lastName: "Thompson",
    email: "emily.thompson@example.com",
    phoneNumber: "+1 555-345-6789",
    graduationYear: "2017",
    degree: "Bachelor of Science",
    major: "Environmental Science",
    currentPosition: "Environmental Consultant",
    company: "EcoSolutions Group",
    location: "Portland, OR",
    bio: "Environmental scientist passionate about sustainability and conservation. Working on projects related to renewable energy and climate change mitigation. Interested in connecting with alumni in environmental fields.",
    skills: ["Environmental Assessment", "GIS", "Data Analysis", "Project Management", "Sustainability Planning"],
    interests: ["Hiking", "Gardening", "Climate Activism", "Birdwatching"],
    avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/emilythompson",
      twitter: "https://twitter.com/emilyt"
    },
    mentorshipStatus: "both",
    mentorshipAreas: ["Environmental Careers", "Sustainability"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2020-08-12"
  },
  {
    id: "alumni-007",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@example.com",
    phoneNumber: "+1 555-456-7890",
    graduationYear: "2016",
    degree: "Doctor of Medicine",
    major: "Medicine",
    currentPosition: "Pediatrician",
    company: "City General Hospital",
    location: "Seattle, WA",
    bio: "Pediatrician with a passion for child health and wellness. Interested in healthcare innovation and medical education. Looking to connect with fellow alumni in healthcare fields.",
    skills: ["Pediatric Care", "Patient Education", "Medical Research", "Healthcare Management"],
    interests: ["Medical Volunteering", "Tennis", "Travel", "Classical Music"],
    avatarUrl: "https://randomuser.me/api/portraits/men/7.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/davidkim"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Medical School Preparation", "Healthcare Careers"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2021-03-30"
  },
  {
    id: "alumni-008",
    firstName: "Olivia",
    lastName: "Martinez",
    email: "olivia.martinez@example.com",
    phoneNumber: "+1 555-567-8901",
    graduationYear: "2021",
    degree: "Bachelor of Science",
    major: "Finance",
    currentPosition: "Financial Analyst",
    company: "Investment Partners LLC",
    location: "Miami, FL",
    bio: "Recent finance graduate working as a financial analyst. Passionate about investment strategies and financial literacy. Looking to connect with alumni in finance and investment banking.",
    skills: ["Financial Modeling", "Investment Analysis", "Excel", "Bloomberg Terminal", "Financial Reporting"],
    interests: ["Stock Market", "Salsa Dancing", "Beach Volleyball", "Economics"],
    avatarUrl: "https://randomuser.me/api/portraits/women/8.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/oliviamartinez"
    },
    mentorshipStatus: "mentee",
    mentorshipAreas: ["Finance Career Paths", "Investment Strategies"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2022-06-15"
  }
];
