export interface Job {
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

export const mockJobs: Job[] = [
  {
    id: "job-001",
    title: "Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    description: "We are looking for a skilled Software Engineer to join our dynamic team. You will be responsible for developing high-quality applications, collaborating with cross-functional teams, and contributing to the full software development lifecycle.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "3+ years of experience in software development",
      "Proficiency in JavaScript, TypeScript, and React",
      "Experience with Node.js and RESTful APIs",
      "Strong problem-solving skills and attention to detail"
    ],
    salary: "$120,000 - $150,000",
    employmentType: "Full-time",
    postedDate: "2025-04-20",
    applicationDeadline: "2025-05-20",
    postedBy: "John Smith (Class of 2015)",
    contactEmail: "jobs@techcorp.com",
    logo: "https://via.placeholder.com/150",
    isRemote: true,
    experienceLevel: "Mid-level",
    industry: "Technology",
    applicationLink: "https://techcorp.com/careers",
    tags: ["software", "engineering", "react", "javascript"]
  },
  {
    id: "job-002",
    title: "Marketing Manager",
    company: "Global Brands Ltd.",
    location: "New York, NY",
    description: "Global Brands is seeking a creative and strategic Marketing Manager to lead our marketing initiatives. You will develop marketing strategies, manage campaigns, and analyze market trends to drive brand growth.",
    requirements: [
      "Bachelor's degree in Marketing or related field",
      "5+ years of experience in marketing roles",
      "Strong understanding of digital marketing channels",
      "Experience with marketing analytics and tools",
      "Excellent communication and leadership skills"
    ],
    salary: "$90,000 - $110,000",
    employmentType: "Full-time",
    postedDate: "2025-04-25",
    applicationDeadline: "2025-05-25",
    postedBy: "Sarah Johnson (Class of 2010)",
    contactEmail: "careers@globalbrands.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Senior",
    industry: "Marketing",
    applicationLink: "https://globalbrands.com/jobs",
    tags: ["marketing", "digital", "management"]
  },
  {
    id: "job-003",
    title: "Data Scientist Intern",
    company: "AnalyticsPro",
    location: "Boston, MA",
    description: "Join our data science team for a summer internship! You'll work on real-world data problems, develop machine learning models, and gain hands-on experience with big data technologies.",
    requirements: [
      "Currently pursuing a degree in Data Science, Statistics, or related field",
      "Knowledge of Python and data analysis libraries",
      "Understanding of machine learning concepts",
      "Strong analytical and problem-solving skills",
      "Ability to work in a fast-paced environment"
    ],
    salary: "$25/hour",
    employmentType: "Internship",
    postedDate: "2025-04-15",
    applicationDeadline: "2025-05-15",
    postedBy: "Michael Chen (Class of 2018)",
    contactEmail: "internships@analyticspro.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Entry-level",
    industry: "Data Science",
    applicationLink: "https://analyticspro.com/internships",
    tags: ["data science", "internship", "python", "machine learning"]
  },
  {
    id: "job-004",
    title: "Financial Analyst",
    company: "Investment Partners LLC",
    location: "Chicago, IL",
    description: "We are looking for a detail-oriented Financial Analyst to join our team. You will be responsible for financial modeling, investment research, and supporting key decision-making processes.",
    requirements: [
      "Bachelor's degree in Finance, Economics, or related field",
      "2+ years of experience in financial analysis",
      "Proficiency in Excel and financial modeling",
      "Knowledge of financial markets and investment principles",
      "Strong analytical and quantitative skills"
    ],
    salary: "$85,000 - $95,000",
    employmentType: "Full-time",
    postedDate: "2025-04-28",
    applicationDeadline: "2025-05-28",
    postedBy: "Robert Williams (Class of 2012)",
    contactEmail: "careers@investmentpartners.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Mid-level",
    industry: "Finance",
    applicationLink: "https://investmentpartners.com/careers",
    tags: ["finance", "analysis", "investments"]
  },
  {
    id: "job-005",
    title: "UX/UI Designer",
    company: "Creative Digital Agency",
    location: "Los Angeles, CA",
    description: "Creative Digital Agency is seeking a talented UX/UI Designer to create engaging and intuitive user experiences. You will work closely with product managers and developers to design beautiful, functional interfaces.",
    requirements: [
      "Bachelor's degree in Design, HCI, or related field",
      "3+ years of experience in UX/UI design",
      "Proficiency in design tools like Figma, Sketch, and Adobe Creative Suite",
      "Strong portfolio demonstrating user-centered design process",
      "Experience with user research and usability testing"
    ],
    salary: "$95,000 - $115,000",
    employmentType: "Full-time",
    postedDate: "2025-04-22",
    applicationDeadline: "2025-05-22",
    postedBy: "Emily Rodriguez (Class of 2016)",
    contactEmail: "jobs@creativedigital.com",
    logo: "https://via.placeholder.com/150",
    isRemote: true,
    experienceLevel: "Mid-level",
    industry: "Design",
    applicationLink: "https://creativedigital.com/careers",
    tags: ["design", "UX", "UI", "creative"]
  },
  {
    id: "job-006",
    title: "Project Manager",
    company: "Construction Enterprises",
    location: "Denver, CO",
    description: "Construction Enterprises is looking for an experienced Project Manager to oversee construction projects from inception to completion. You will be responsible for project planning, resource allocation, and client communication.",
    requirements: [
      "Bachelor's degree in Construction Management, Engineering, or related field",
      "5+ years of experience in construction project management",
      "PMP certification preferred",
      "Knowledge of construction methods, materials, and regulations",
      "Strong leadership and communication skills"
    ],
    salary: "$100,000 - $130,000",
    employmentType: "Full-time",
    postedDate: "2025-04-18",
    applicationDeadline: "2025-05-18",
    postedBy: "David Thompson (Class of 2008)",
    contactEmail: "careers@constructionenterprises.com",
    logo: "https://via.placeholder.com/150",
    isRemote: false,
    experienceLevel: "Senior",
    industry: "Construction",
    applicationLink: "https://constructionenterprises.com/jobs",
    tags: ["construction", "project management", "engineering"]
  }
];
