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
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@example.com",
    phoneNumber: "+91 98765-43210",
    graduationYear: "2018",
    degree: "Bachelor of Technology",
    major: "Marine Engineering",
    currentPosition: "Chief Engineer",
    company: "Maersk Line",
    location: "Chennai, India",
    bio: "Experienced marine engineer with expertise in ship propulsion systems and maritime operations. Certified by IMO with 5+ years of experience on international vessels. Passionate about sustainable maritime technologies.",
    skills: ["Ship Propulsion", "Engine Maintenance", "Maritime Safety", "MARPOL Regulations", "Technical Documentation"],
    interests: ["Renewable Marine Energy", "Maritime Technology", "Sailing", "Underwater Photography"],
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/rajeshkumar",
      twitter: "https://twitter.com/rajeshk"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Marine Engineering", "Maritime Career Guidance", "Technical Certifications"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2022-03-15"
  },
  {
    id: "alumni-002",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    phoneNumber: "+91 87654-32109",
    graduationYear: "2020",
    degree: "Master of Business Administration",
    major: "Shipping Management",
    currentPosition: "Logistics Director",
    company: "Global Maritime Logistics",
    location: "Mumbai, India",
    bio: "Shipping management professional specializing in maritime logistics and supply chain optimization. MBA graduate with experience in port operations and international shipping regulations. Seeking to connect with alumni in maritime business and logistics sectors.",
    skills: ["Maritime Logistics", "Supply Chain Management", "Port Operations", "Shipping Regulations", "Business Analytics"],
    interests: ["International Trade", "Maritime Economics", "Travel", "Yoga"],
    avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/priyasharma",
      twitter: "https://twitter.com/priyas"
    },
    mentorshipStatus: "both",
    mentorshipAreas: ["Maritime Business", "Logistics Management"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2022-05-20"
  },
  {
    id: "alumni-003",
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@example.com",
    phoneNumber: "+91 76543-21098",
    graduationYear: "2019",
    degree: "Master of Technology",
    major: "Naval Architecture",
    currentPosition: "Naval Architect",
    company: "Cochin Shipyard Limited",
    location: "Kochi, India",
    bio: "Naval architect specializing in ship design and structural analysis. Experienced in using advanced computational tools for hydrodynamic modeling and vessel optimization. Interested in connecting with professionals in shipbuilding and maritime design.",
    skills: ["Ship Design", "Structural Analysis", "Hydrodynamics", "CAD/CAM", "Classification Society Regulations"],
    interests: ["Maritime Innovation", "Sustainable Ship Design", "3D Modeling", "Sailing"],
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/vikramsingh",
      github: "https://github.com/vsingh",
      website: "https://vikramsingh.design"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Naval Architecture", "Ship Design", "Maritime Engineering"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2022-04-10"
  },
  {
    id: "alumni-004",
    firstName: "Aisha",
    lastName: "Kapoor",
    email: "aisha.kapoor@example.com",
    phoneNumber: "+91 65432-10987",
    graduationYear: "2017",
    degree: "Bachelor of Technology",
    major: "Computer Science & Engineering",
    currentPosition: "Maritime Software Developer",
    company: "OceanTech Solutions",
    location: "Bangalore, India",
    bio: "Software developer specializing in maritime technology solutions. Experienced in developing vessel tracking systems, port management software, and maritime cybersecurity applications. Passionate about applying advanced computing to solve maritime challenges.",
    skills: ["Maritime Software Development", "IoT for Shipping", "Maritime Cybersecurity", "GIS", "Fleet Management Systems"],
    interests: ["Maritime Technology", "Artificial Intelligence", "Sailing", "Diving"],
    avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/aishakapoor",
      github: "https://github.com/akapoor",
      twitter: "https://twitter.com/aishak"
    },
    mentorshipStatus: "mentee",
    mentorshipAreas: ["Maritime Technology", "Software Development"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2022-02-05"
  },
  {
    id: "alumni-005",
    firstName: "Arjun",
    lastName: "Nair",
    email: "arjun.nair@example.com",
    phoneNumber: "+91 54321-09876",
    graduationYear: "2016",
    degree: "Bachelor of Science",
    major: "Nautical Science",
    currentPosition: "Second Officer",
    company: "Shipping Corporation of India",
    location: "Chennai, India",
    bio: "Nautical officer with extensive experience in navigation and vessel operations. Certified by DG Shipping with expertise in maritime safety protocols and international maritime regulations. Looking to connect with fellow maritime professionals.",
    skills: ["Navigation", "GMDSS", "Maritime Safety", "Cargo Operations", "ECDIS"],
    interests: ["Maritime Law", "Celestial Navigation", "Marine Conservation", "Photography"],
    avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/arjunnair"
    },
    mentorshipStatus: "none",
    isAvailableForRecruitment: true,
    isVerified: false,
    joinedDate: "2022-06-15"
  },
  {
    id: "alumni-006",
    firstName: "Meera",
    lastName: "Desai",
    email: "meera.desai@example.com",
    phoneNumber: "+91 43210-98765",
    graduationYear: "2018",
    degree: "Master of Science",
    major: "Marine Biotechnology",
    currentPosition: "Marine Biotechnologist",
    company: "OceanLife Research",
    location: "Goa, India",
    bio: "Marine biotechnologist researching sustainable applications of marine organisms for pharmaceutical and industrial uses. Specializing in marine bioprospecting and blue biotechnology. Passionate about marine conservation and sustainable use of ocean resources.",
    skills: ["Marine Biotechnology", "Molecular Biology", "Bioprospecting", "Laboratory Techniques", "Research Methodology"],
    interests: ["Marine Conservation", "Scuba Diving", "Sustainable Development", "Marine Biodiversity"],
    avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/meeradesai",
      twitter: "https://twitter.com/meerad"
    },
    mentorshipStatus: "mentor",
    mentorshipAreas: ["Marine Biotechnology", "Research Careers", "Women in STEM"],
    isAvailableForRecruitment: false,
    isVerified: true,
    joinedDate: "2022-07-20"
  },
  {
    id: "alumni-007",
    firstName: "Sunil",
    lastName: "Menon",
    email: "sunil.menon@example.com",
    phoneNumber: "+91 32109-87654",
    graduationYear: "2015",
    degree: "MBA",
    major: "Port & Shipping Management",
    currentPosition: "Port Operations Manager",
    company: "Adani Ports",
    location: "Mundra, India",
    bio: "Port management professional with expertise in terminal operations, logistics, and supply chain management. Experienced in implementing efficiency improvements and technology solutions for port operations. Interested in connecting with professionals in maritime logistics and port management.",
    skills: ["Port Operations", "Terminal Management", "Maritime Logistics", "Supply Chain Optimization", "Project Management"],
    interests: ["Maritime Infrastructure", "Smart Ports", "International Trade", "Cricket"],
    avatarUrl: "https://randomuser.me/api/portraits/men/7.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/sunilmenon"
    },
    mentorshipStatus: "both",
    mentorshipAreas: ["Port Management", "Maritime Logistics", "Career Development"],
    isAvailableForRecruitment: true,
    isVerified: true,
    joinedDate: "2022-05-10"
  }
];
