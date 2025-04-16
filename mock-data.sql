-- Mock Data for Alumni Management System

-- First, let's create some mock profiles for the directory
INSERT INTO profiles (id, email, first_name, last_name, graduation_year, degree, major, current_company, current_position, location, bio, linkedin_url, is_verified, is_mentor, avatar_url)
VALUES
  (gen_random_uuid(), 'john.doe@example.com', 'John', 'Doe', 2018, 'Bachelor of Science', 'Computer Science', 'Tech Innovations Inc.', 'Senior Software Engineer', 'San Francisco, CA', 'Experienced software engineer with a passion for building scalable applications. I enjoy mentoring junior developers and contributing to open source projects.', 'https://linkedin.com/in/johndoe', TRUE, TRUE, 'https://randomuser.me/api/portraits/men/1.jpg'),
  
  (gen_random_uuid(), 'jane.smith@example.com', 'Jane', 'Smith', 2019, 'Master of Business Administration', 'Finance', 'Global Finance Partners', 'Investment Analyst', 'New York, NY', 'MBA graduate specializing in investment analysis and financial modeling. Looking to connect with fellow alumni in the finance sector.', 'https://linkedin.com/in/janesmith', TRUE, FALSE, 'https://randomuser.me/api/portraits/women/2.jpg'),
  
  (gen_random_uuid(), 'michael.johnson@example.com', 'Michael', 'Johnson', 2020, 'Bachelor of Arts', 'Marketing', 'Creative Marketing Solutions', 'Marketing Manager', 'Chicago, IL', 'Marketing professional with experience in digital advertising and brand strategy. Happy to help fellow alumni break into the marketing industry.', 'https://linkedin.com/in/michaeljohnson', TRUE, TRUE, 'https://randomuser.me/api/portraits/men/3.jpg'),
  
  (gen_random_uuid(), 'emily.wilson@example.com', 'Emily', 'Wilson', 2017, 'PhD', 'Biochemistry', 'BioPharma Research', 'Research Scientist', 'Boston, MA', 'Biochemist working on drug discovery and development. Passionate about mentoring students interested in careers in scientific research.', 'https://linkedin.com/in/emilywilson', TRUE, TRUE, 'https://randomuser.me/api/portraits/women/4.jpg'),
  
  (gen_random_uuid(), 'david.garcia@example.com', 'David', 'Garcia', 2021, 'Bachelor of Engineering', 'Mechanical Engineering', 'Advanced Manufacturing Co.', 'Product Engineer', 'Austin, TX', 'Recent graduate working on innovative manufacturing technologies. Looking to connect with alumni in the engineering field.', 'https://linkedin.com/in/davidgarcia', TRUE, FALSE, 'https://randomuser.me/api/portraits/men/5.jpg'),
  
  (gen_random_uuid(), 'sarah.lee@example.com', 'Sarah', 'Lee', 2016, 'Master of Arts', 'Education', 'Bright Future Academy', 'Curriculum Developer', 'Seattle, WA', 'Education specialist focused on developing innovative curriculum for K-12 students. Interested in connecting with fellow educators.', 'https://linkedin.com/in/sarahlee', TRUE, FALSE, 'https://randomuser.me/api/portraits/women/6.jpg'),
  
  (gen_random_uuid(), 'robert.brown@example.com', 'Robert', 'Brown', 2015, 'Bachelor of Science', 'Data Science', 'Data Insights Corporation', 'Data Science Director', 'Denver, CO', 'Data science leader with extensive experience in analytics and machine learning. Happy to mentor students interested in data-related careers.', 'https://linkedin.com/in/robertbrown', TRUE, TRUE, 'https://randomuser.me/api/portraits/men/7.jpg'),
  
  (gen_random_uuid(), 'jennifer.miller@example.com', 'Jennifer', 'Miller', 2019, 'Bachelor of Fine Arts', 'Graphic Design', 'Creative Designs Studio', 'Senior Designer', 'Los Angeles, CA', 'Creative designer with a passion for visual storytelling and brand identity development. Looking to connect with fellow alumni in the creative industries.', 'https://linkedin.com/in/jennifermiller', TRUE, FALSE, 'https://randomuser.me/api/portraits/women/8.jpg');

-- Store profile IDs in variables for reference in other tables
DO $$
DECLARE
    mentor_profile_id UUID;
    admin_profile_id UUID;
BEGIN
    -- Get a mentor profile ID for events and jobs
    SELECT id INTO mentor_profile_id FROM profiles WHERE is_mentor = TRUE LIMIT 1;
    
    -- Get any profile for admin role
    SELECT id INTO admin_profile_id FROM profiles LIMIT 1;
    
    -- Make sure we have a creator for events
    IF mentor_profile_id IS NULL THEN
        mentor_profile_id := admin_profile_id;
    END IF;

    -- Create mock events
    INSERT INTO events (creator_id, title, description, location, is_virtual, virtual_meeting_link, start_date, end_date, max_attendees, image_url, is_published)
    VALUES
      (mentor_profile_id, 'Annual Alumni Networking Mixer', 'Join us for our annual networking event! Connect with fellow alumni, share experiences, and build valuable professional relationships.', 'Grand Hotel, Downtown', FALSE, NULL, NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '4 hours', 150, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', TRUE),
      
      (mentor_profile_id, 'Tech Industry Panel Discussion', 'Hear from industry experts about the latest trends in technology. Panelists include senior leaders from major tech companies.', 'University Auditorium', FALSE, NULL, NOW() + INTERVAL '45 days', NOW() + INTERVAL '45 days' + INTERVAL '3 hours', 200, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b', TRUE),
      
      (mentor_profile_id, 'Virtual Career Workshop', 'Enhance your job search skills with this interactive workshop. Topics include resume building, interview preparation, and personal branding.', NULL, TRUE, 'https://zoom.us/j/example', NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days' + INTERVAL '2 hours', 100, 'https://images.unsplash.com/photo-1552664730-d307ca884978', TRUE),
      
      (mentor_profile_id, 'Entrepreneurship Bootcamp', 'A two-day intensive program for aspiring entrepreneurs. Learn about business planning, funding, and bringing your ideas to market.', 'Business School Campus', FALSE, NULL, NOW() + INTERVAL '60 days', NOW() + INTERVAL '62 days', 50, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644', TRUE),
      
      (mentor_profile_id, 'Alumni Homecoming Weekend', 'Return to campus for a weekend of celebrations, networking, and reconnecting with old friends. Various activities planned throughout the weekend.', 'Main Campus', FALSE, NULL, NOW() + INTERVAL '90 days', NOW() + INTERVAL '92 days', 500, 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f', TRUE),
      
      (mentor_profile_id, 'Industry Insights: Healthcare', 'Learn about career opportunities and recent developments in the healthcare industry from experienced professionals.', 'Medical School Lecture Hall', FALSE, NULL, NOW() + INTERVAL '40 days', NOW() + INTERVAL '40 days' + INTERVAL '3 hours', 120, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118', TRUE),
      
      (mentor_profile_id, 'Graduate Studies Information Session', 'Considering further education? Join this session to learn about graduate programs, application processes, and funding opportunities.', NULL, TRUE, 'https://zoom.us/j/example2', NOW() + INTERVAL '25 days', NOW() + INTERVAL '25 days' + INTERVAL '2 hours', 150, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1', TRUE);

    -- Create mock job listings
    INSERT INTO job_listings (creator_id, company_name, title, description, location, is_remote, job_type, salary_min, salary_max, application_url, contact_email, is_published, expires_at)
    VALUES
      (mentor_profile_id, 'Tech Innovations Inc.', 'Senior Software Engineer', 'We are seeking an experienced software engineer to join our team. You will be responsible for designing and implementing new features, collaborating with cross-functional teams, and mentoring junior developers.', 'San Francisco, CA', FALSE, 'full-time', 120000, 150000, 'https://techinnovations.com/careers', 'jobs@techinnovations.com', TRUE, NOW() + INTERVAL '30 days'),
      
      (mentor_profile_id, 'Global Finance Partners', 'Investment Analyst', 'Join our investment team to analyze market trends, evaluate investment opportunities, and prepare financial models and reports. Ideal candidates have a strong background in finance and excellent analytical skills.', 'New York, NY', FALSE, 'full-time', 85000, 110000, 'https://globalfinance.com/careers', 'careers@globalfinance.com', TRUE, NOW() + INTERVAL '45 days'),
      
      (mentor_profile_id, 'Creative Marketing Solutions', 'Digital Marketing Specialist', 'We are looking for a creative and data-driven marketing specialist to manage digital campaigns, analyze marketing performance, and identify opportunities for optimization.', 'Chicago, IL', TRUE, 'full-time', 70000, 90000, 'https://creativemarketing.com/jobs', 'hr@creativemarketing.com', TRUE, NOW() + INTERVAL '60 days'),
      
      (mentor_profile_id, 'BioPharma Research', 'Research Associate', 'Join our research team working on cutting-edge pharmaceutical developments. Responsibilities include conducting experiments, analyzing data, and contributing to research publications.', 'Boston, MA', FALSE, 'full-time', 75000, 95000, 'https://biopharma.com/careers', 'jobs@biopharma.com', TRUE, NOW() + INTERVAL '30 days'),
      
      (mentor_profile_id, 'Bright Future Academy', 'Curriculum Development Specialist', 'Help shape the future of education by developing innovative curriculum materials for K-12 students. Ideal candidates have experience in education and a passion for creating engaging learning experiences.', 'Remote', TRUE, 'full-time', 65000, 85000, 'https://brightfuture.edu/careers', 'hr@brightfuture.edu', TRUE, NOW() + INTERVAL '45 days'),
      
      (mentor_profile_id, 'Data Insights Corporation', 'Data Scientist', 'We are seeking a talented data scientist to join our analytics team. You will work on complex data problems, develop machine learning models, and generate actionable insights for our clients.', 'Denver, CO', TRUE, 'full-time', 110000, 140000, 'https://datainsights.com/jobs', 'careers@datainsights.com', TRUE, NOW() + INTERVAL '60 days'),
      
      (mentor_profile_id, 'Advanced Manufacturing Co.', 'Product Engineer', 'Join our engineering team to design, develop, and improve manufacturing processes and products. Ideal candidates have experience in mechanical engineering and product development.', 'Austin, TX', FALSE, 'full-time', 90000, 120000, 'https://advmfg.com/careers', 'jobs@advmfg.com', TRUE, NOW() + INTERVAL '30 days'),
      
      (mentor_profile_id, 'Creative Designs Studio', 'Senior Graphic Designer', 'We are looking for a creative and experienced graphic designer to join our team. You will work on various design projects for clients across different industries.', 'Los Angeles, CA', FALSE, 'full-time', 80000, 100000, 'https://creativedesigns.com/careers', 'hr@creativedesigns.com', TRUE, NOW() + INTERVAL '45 days');

    -- Create mock mentorship programs
    INSERT INTO mentorship_programs (title, description, start_date, end_date, is_active)
    VALUES
      ('Career Kickstart Program', 'A six-month mentorship program designed to help recent graduates transition into their professional careers. Mentees will be matched with experienced professionals in their field of interest.', NOW(), NOW() + INTERVAL '6 months', TRUE),
      
      ('Leadership Development Initiative', 'This program focuses on developing leadership skills for mid-career professionals. Participants will receive guidance from senior leaders and executives.', NOW() + INTERVAL '1 month', NOW() + INTERVAL '7 months', TRUE),
      
      ('Entrepreneurship Mentoring', 'Connect with successful entrepreneurs who can provide guidance on starting and growing your own business. Ideal for alumni interested in entrepreneurship.', NOW() + INTERVAL '2 months', NOW() + INTERVAL '8 months', TRUE),
      
      ('Technical Career Advancement', 'A specialized program for technology professionals looking to advance their careers. Mentors include tech leaders from various industries.', NOW(), NOW() + INTERVAL '6 months', TRUE),
      
      ('Academic to Industry Transition', 'Designed for PhD graduates transitioning from academia to industry. Mentors will help navigate this career change and leverage academic skills in corporate settings.', NOW() + INTERVAL '1 month', NOW() + INTERVAL '7 months', TRUE);

    -- Create mentorship relationships
    INSERT INTO mentorship_relationships (program_id, mentor_id, mentee_id, status)
    WITH mentor_ids AS (
      SELECT id FROM profiles WHERE is_mentor = TRUE
    ),
    mentee_ids AS (
      SELECT id FROM profiles WHERE is_mentor = FALSE
    ),
    mentorship_program_ids AS (
      SELECT id FROM mentorship_programs
    ),
    mentor_mentee_pairs AS (
      SELECT 
        mentor_ids.id AS mentor_id,
        mentee_ids.id AS mentee_id,
        mentorship_program_ids.id AS program_id,
        ROW_NUMBER() OVER () AS row_num
      FROM 
        mentor_ids, mentee_ids, mentorship_program_ids
    )
    SELECT 
      program_id,
      mentor_id,
      mentee_id,
      CASE WHEN row_num % 3 = 0 THEN 'pending' WHEN row_num % 3 = 1 THEN 'active' ELSE 'completed' END
    FROM 
      mentor_mentee_pairs
    LIMIT 8;
END $$;
