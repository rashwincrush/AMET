export interface MarineJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedDate: string;
  applicationDeadline: string;
  postedBy: string;
  contactEmail: string;
  logo?: string;
  isRemote: boolean;
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive';
  industry: string;
  applicationLink?: string;
  tags: string[];
}

export const marineJobs = [
  {
    id: "marine-001",
    title: "Marine Engineer",
    company: "Global Shipping Inc.",
    location: "Singapore",
    description: "We are seeking a qualified Marine Engineer to join our technical team. You will be responsible for the maintenance, operation, and repair of ship machinery and equipment, ensuring compliance with safety and environmental regulations.",
    requirements: [
      "Bachelor's degree in Marine Engineering or Naval Architecture",
      "Valid Marine Engineer's license",
      "3+ years of experience on commercial vessels",
      "Knowledge of marine propulsion systems and auxiliary equipment",
      "Strong problem-solving and technical skills"
    ],
    salary: "$85,000 - $110,000",
    employmentType: "Full-time",
    postedDate: "2025-04-15",
    applicationDeadline: "2025-05-25",
    postedBy: "Capt. James Wilson (Class of 2010)",
    contactEmail: "careers@globalshipping.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Mid-level",
    industry: "Maritime",
    applicationLink: "https://globalshipping.com/careers",
    tags: ["marine", "engineering", "technical", "vessels"]
  },
  {
    id: "marine-002",
    title: "Port Operations Manager",
    company: "Harbor Management Solutions",
    location: "Rotterdam, Netherlands",
    description: "Oversee daily port operations, coordinate vessel arrivals and departures, manage terminal staff, and ensure efficient cargo handling. This position requires excellent coordination and communication skills to maintain safe and efficient port operations.",
    requirements: [
      "Bachelor's degree in Maritime Studies, Logistics, or related field",
      "5+ years of experience in port operations",
      "Strong knowledge of maritime regulations and procedures",
      "Experience with port management software systems",
      "Excellent leadership and communication skills"
    ],
    salary: "$90,000 - $120,000",
    employmentType: "Full-time",
    postedDate: "2025-04-18",
    applicationDeadline: "2025-05-30",
    postedBy: "Maria Sanchez (Class of 2008)",
    contactEmail: "hr@harbormanagement.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Senior",
    industry: "Maritime",
    applicationLink: "https://harbormanagement.com/jobs",
    tags: ["port operations", "maritime", "management", "logistics"]
  },
  {
    id: "marine-003",
    title: "Naval Architect",
    company: "Advanced Marine Design",
    location: "Helsinki, Finland",
    description: "Join our innovative design team working on next-generation marine vessels. You will contribute to vessel design, performance analysis, stability calculations, and structural engineering, ensuring compliance with classification society rules.",
    requirements: [
      "Master's degree in Naval Architecture or Marine Engineering",
      "3+ years of experience in ship design",
      "Proficiency in naval architecture software (e.g., Rhino, Maxsurf, NAPA)",
      "Knowledge of international maritime regulations",
      "Experience with CAD software and 3D modeling"
    ],
    salary: "$95,000 - $125,000",
    employmentType: "Full-time",
    postedDate: "2025-04-20",
    applicationDeadline: "2025-06-01",
    postedBy: "Erik Johansson (Class of 2012)",
    contactEmail: "careers@advancedmarinedesign.com",
    logo: "https://via.placeholder.com/150",
    isRemote: true,
    experienceLevel: "Mid-level",
    industry: "Maritime",
    applicationLink: "https://advancedmarinedesign.com/careers",
    tags: ["naval architecture", "design", "engineering", "vessels"]
  },
  {
    id: "marine-004",
    title: "Marine Surveyor",
    company: "Maritime Inspection Services",
    location: "Dubai, UAE",
    description: "Conduct thorough inspections of vessels to assess condition, seaworthiness, and compliance with maritime regulations. You will prepare detailed reports, identify deficiencies, and provide recommendations to vessel owners and operators.",
    requirements: [
      "Degree in Marine Engineering, Naval Architecture, or related field",
      "Relevant surveyor certification (NAMS, SAMS, or equivalent)",
      "5+ years of experience in vessel inspection",
      "In-depth knowledge of maritime regulations and standards",
      "Strong attention to detail and reporting skills"
    ],
    salary: "$80,000 - $100,000",
    employmentType: "Full-time",
    postedDate: "2025-04-22",
    applicationDeadline: "2025-05-28",
    postedBy: "Ahmed Al-Farsi (Class of 2011)",
    contactEmail: "jobs@maritimeinspection.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Senior",
    industry: "Maritime",
    applicationLink: "https://maritimeinspection.com/careers",
    tags: ["surveyor", "inspection", "maritime", "compliance"]
  },
  {
    id: "marine-005",
    title: "Deck Officer",
    company: "Blue Ocean Shipping",
    location: "Miami, FL",
    description: "We are looking for a licensed Deck Officer to join our merchant fleet. You will be responsible for navigation, cargo operations, and safety on board our vessels, ensuring compliance with international maritime regulations.",
    requirements: [
      "Valid STCW II/1 or II/2 certification",
      "3+ years of sea time as a deck officer",
      "Strong navigation and seafaring skills",
      "Knowledge of IMO, SOLAS, and MARPOL regulations",
      "Excellent communication and leadership skills"
    ],
    salary: "$70,000 - $90,000",
    employmentType: "Contract",
    postedDate: "2025-04-25",
    applicationDeadline: "2025-06-10",
    postedBy: "Capt. Michael Rodriguez (Class of 2009)",
    contactEmail: "crewing@blueoceanshipping.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Mid-level",
    industry: "Maritime",
    applicationLink: "https://blueoceanshipping.com/careers",
    tags: ["deck officer", "navigation", "seafaring", "maritime"]
  },
  {
    id: "marine-006",
    title: "Marine Environmental Specialist",
    company: "Ocean Conservation Institute",
    location: "San Diego, CA",
    description: "Join our team working on marine conservation and environmental compliance. You will develop and implement environmental management plans for marine operations, conduct assessments, and ensure compliance with environmental regulations.",
    requirements: [
      "Bachelor's degree in Environmental Science, Marine Biology, or related field",
      "3+ years of experience in marine environmental management",
      "Knowledge of MARPOL and other environmental regulations",
      "Experience with environmental impact assessments",
      "Strong analytical and reporting skills"
    ],
    salary: "$75,000 - $95,000",
    employmentType: "Full-time",
    postedDate: "2025-04-28",
    applicationDeadline: "2025-06-15",
    postedBy: "Dr. Sarah Miller (Class of 2013)",
    contactEmail: "careers@oceanconservation.org",
    logo: "https://via.placeholder.com/150",
    isRemote: true,
    experienceLevel: "Mid-level",
    industry: "Maritime",
    applicationLink: "https://oceanconservation.org/careers",
    tags: ["environmental", "conservation", "maritime", "compliance"]
  }
];
