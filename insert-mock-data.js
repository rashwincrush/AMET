require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertMockData() {
  console.log('Starting to insert mock data...');
  
  try {
    // Define user data
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        graduationYear: 2018,
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        currentCompany: 'Tech Innovations Inc.',
        currentPosition: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        bio: 'Experienced software engineer with a passion for building scalable applications. I enjoy mentoring junior developers and contributing to open source projects.',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        isVerified: true,
        isMentor: true,
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        email: 'jane.smith@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        graduationYear: 2019,
        degree: 'Master of Business Administration',
        major: 'Finance',
        currentCompany: 'Global Finance Partners',
        currentPosition: 'Investment Analyst',
        location: 'New York, NY',
        bio: 'MBA graduate specializing in investment analysis and financial modeling. Looking to connect with fellow alumni in the finance sector.',
        linkedinUrl: 'https://linkedin.com/in/janesmith',
        isVerified: true,
        isMentor: false,
        avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      {
        email: 'michael.johnson@example.com',
        password: 'Password123!',
        firstName: 'Michael',
        lastName: 'Johnson',
        graduationYear: 2020,
        degree: 'Bachelor of Arts',
        major: 'Marketing',
        currentCompany: 'Creative Marketing Solutions',
        currentPosition: 'Marketing Manager',
        location: 'Chicago, IL',
        bio: 'Marketing professional with experience in digital advertising and brand strategy. Happy to help fellow alumni break into the marketing industry.',
        linkedinUrl: 'https://linkedin.com/in/michaeljohnson',
        isVerified: true,
        isMentor: true,
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      {
        email: 'emily.wilson@example.com',
        password: 'Password123!',
        firstName: 'Emily',
        lastName: 'Wilson',
        graduationYear: 2017,
        degree: 'PhD',
        major: 'Biochemistry',
        currentCompany: 'BioPharma Research',
        currentPosition: 'Research Scientist',
        location: 'Boston, MA',
        bio: 'Biochemist working on drug discovery and development. Passionate about mentoring students interested in careers in scientific research.',
        linkedinUrl: 'https://linkedin.com/in/emilywilson',
        isVerified: true,
        isMentor: true,
        avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      {
        email: 'david.garcia@example.com',
        password: 'Password123!',
        firstName: 'David',
        lastName: 'Garcia',
        graduationYear: 2021,
        degree: 'Bachelor of Engineering',
        major: 'Mechanical Engineering',
        currentCompany: 'Advanced Manufacturing Co.',
        currentPosition: 'Product Engineer',
        location: 'Austin, TX',
        bio: 'Recent graduate working on innovative manufacturing technologies. Looking to connect with alumni in the engineering field.',
        linkedinUrl: 'https://linkedin.com/in/davidgarcia',
        isVerified: true,
        isMentor: false,
        avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      {
        email: 'sarah.lee@example.com',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Lee',
        graduationYear: 2016,
        degree: 'Master of Arts',
        major: 'Education',
        currentCompany: 'Bright Future Academy',
        currentPosition: 'Curriculum Developer',
        location: 'Seattle, WA',
        bio: 'Education specialist focused on developing innovative curriculum for K-12 students. Interested in connecting with fellow educators.',
        linkedinUrl: 'https://linkedin.com/in/sarahlee',
        isVerified: true,
        isMentor: false,
        avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg'
      },
      {
        email: 'robert.brown@example.com',
        password: 'Password123!',
        firstName: 'Robert',
        lastName: 'Brown',
        graduationYear: 2015,
        degree: 'Bachelor of Science',
        major: 'Data Science',
        currentCompany: 'Data Insights Corporation',
        currentPosition: 'Data Science Director',
        location: 'Denver, CO',
        bio: 'Data science leader with extensive experience in analytics and machine learning. Happy to mentor students interested in data-related careers.',
        linkedinUrl: 'https://linkedin.com/in/robertbrown',
        isVerified: true,
        isMentor: true,
        avatarUrl: 'https://randomuser.me/api/portraits/men/7.jpg'
      },
      {
        email: 'jennifer.miller@example.com',
        password: 'Password123!',
        firstName: 'Jennifer',
        lastName: 'Miller',
        graduationYear: 2019,
        degree: 'Bachelor of Fine Arts',
        major: 'Graphic Design',
        currentCompany: 'Creative Designs Studio',
        currentPosition: 'Senior Designer',
        location: 'Los Angeles, CA',
        bio: 'Creative designer with a passion for visual storytelling and brand identity development. Looking to connect with fellow alumni in the creative industries.',
        linkedinUrl: 'https://linkedin.com/in/jennifermiller',
        isVerified: true,
        isMentor: false,
        avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg'
      }
    ];
    
    // Create users and profiles
    const createdUserIds = [];
    
    console.log('Creating users and profiles...');
    for (const user of users) {
      try {
        // Create the user in auth system
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName
          }
        });
        
        if (userError) {
          console.error(`Error creating user ${user.email}:`, userError);
          continue;
        }
        
        console.log(`Created user: ${user.email} with ID: ${userData.user.id}`);
        createdUserIds.push(userData.user.id);
        
        // Update the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: user.firstName,
            last_name: user.lastName,
            graduation_year: user.graduationYear,
            degree: user.degree,
            major: user.major,
            current_company: user.currentCompany,
            current_position: user.currentPosition,
            location: user.location,
            bio: user.bio,
            linkedin_url: user.linkedinUrl,
            is_verified: user.isVerified,
            is_mentor: user.isMentor,
            avatar_url: user.avatarUrl
          })
          .eq('id', userData.user.id);
        
        if (profileError) {
          console.error(`Error updating profile for ${user.email}:`, profileError);
        } else {
          console.log(`Updated profile for: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }
    
    if (createdUserIds.length === 0) {
      console.error('No users were created. Exiting.');
      return;
    }
    
    // Get a mentor ID for creating events and jobs
    let mentorId = null;
    
    // Get all profiles to find mentors
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', createdUserIds);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }
    
    // Find a mentor profile
    for (const profile of profiles) {
      if (profile.is_mentor) {
        mentorId = profile.id;
        break;
      }
    }
    
    if (!mentorId) {
      console.warn('No mentor profile found, using the first profile as creator');
      mentorId = profiles[0].id;
    }
    
    // Create events
    const now = new Date();
    const events = [
      {
        creator_id: mentorId,
        title: 'Annual Alumni Networking Mixer',
        description: 'Join us for our annual networking event! Connect with fellow alumni, share experiences, and build valuable professional relationships.',
        location: 'Grand Hotel, Downtown',
        is_virtual: false,
        start_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        max_attendees: 150,
        image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Tech Industry Panel Discussion',
        description: 'Hear from industry experts about the latest trends in technology. Panelists include senior leaders from major tech companies.',
        location: 'University Auditorium',
        is_virtual: false,
        start_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 200,
        image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Virtual Career Workshop',
        description: 'Enhance your job search skills with this interactive workshop. Topics include resume building, interview preparation, and personal branding.',
        is_virtual: true,
        virtual_meeting_link: 'https://zoom.us/j/example',
        start_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Entrepreneurship Bootcamp',
        description: 'A two-day intensive program for aspiring entrepreneurs. Learn about business planning, funding, and bringing your ideas to market.',
        location: 'Business School Campus',
        is_virtual: false,
        start_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 62 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 50,
        image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Alumni Homecoming Weekend',
        description: 'Return to campus for a weekend of celebrations, networking, and reconnecting with old friends. Various activities planned throughout the weekend.',
        location: 'Main Campus',
        is_virtual: false,
        start_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 92 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 500,
        image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Industry Insights: Healthcare',
        description: 'Learn about career opportunities and recent developments in the healthcare industry from experienced professionals.',
        location: 'Medical School Lecture Hall',
        is_virtual: false,
        start_date: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 120,
        image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
        is_published: true
      },
      {
        creator_id: mentorId,
        title: 'Graduate Studies Information Session',
        description: 'Considering further education? Join this session to learn about graduate programs, application processes, and funding opportunities.',
        is_virtual: true,
        virtual_meeting_link: 'https://zoom.us/j/example2',
        start_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        max_attendees: 150,
        image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
        is_published: true
      }
    ];
    
    console.log('Inserting events...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .upsert(events)
      .select();
    
    if (eventsError) {
      console.error('Error inserting events:', eventsError);
    } else {
      console.log(`Successfully inserted ${eventsData.length} events`);
    }
    
    // Create job listings
    const jobs = [
      {
        creator_id: mentorId,
        company_name: 'Tech Innovations Inc.',
        title: 'Senior Software Engineer',
        description: 'We are seeking an experienced software engineer to join our team. You will be responsible for designing and implementing new features, collaborating with cross-functional teams, and mentoring junior developers.',
        location: 'San Francisco, CA',
        is_remote: false,
        job_type: 'full-time',
        salary_min: 120000,
        salary_max: 150000,
        application_url: 'https://techinnovations.com/careers',
        contact_email: 'jobs@techinnovations.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Global Finance Partners',
        title: 'Investment Analyst',
        description: 'Join our investment team to analyze market trends, evaluate investment opportunities, and prepare financial models and reports. Ideal candidates have a strong background in finance and excellent analytical skills.',
        location: 'New York, NY',
        is_remote: false,
        job_type: 'full-time',
        salary_min: 85000,
        salary_max: 110000,
        application_url: 'https://globalfinance.com/careers',
        contact_email: 'careers@globalfinance.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Creative Marketing Solutions',
        title: 'Digital Marketing Specialist',
        description: 'We are looking for a creative and data-driven marketing specialist to manage digital campaigns, analyze marketing performance, and identify opportunities for optimization.',
        location: 'Chicago, IL',
        is_remote: true,
        job_type: 'full-time',
        salary_min: 70000,
        salary_max: 90000,
        application_url: 'https://creativemarketing.com/jobs',
        contact_email: 'hr@creativemarketing.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'BioPharma Research',
        title: 'Research Associate',
        description: 'Join our research team working on cutting-edge pharmaceutical developments. Responsibilities include conducting experiments, analyzing data, and contributing to research publications.',
        location: 'Boston, MA',
        is_remote: false,
        job_type: 'full-time',
        salary_min: 75000,
        salary_max: 95000,
        application_url: 'https://biopharma.com/careers',
        contact_email: 'jobs@biopharma.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Bright Future Academy',
        title: 'Curriculum Development Specialist',
        description: 'Help shape the future of education by developing innovative curriculum materials for K-12 students. Ideal candidates have experience in education and a passion for creating engaging learning experiences.',
        location: 'Remote',
        is_remote: true,
        job_type: 'full-time',
        salary_min: 65000,
        salary_max: 85000,
        application_url: 'https://brightfuture.edu/careers',
        contact_email: 'hr@brightfuture.edu',
        is_published: true,
        expires_at: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Data Insights Corporation',
        title: 'Data Scientist',
        description: 'We are seeking a talented data scientist to join our analytics team. You will work on complex data problems, develop machine learning models, and generate actionable insights for our clients.',
        location: 'Denver, CO',
        is_remote: true,
        job_type: 'full-time',
        salary_min: 110000,
        salary_max: 140000,
        application_url: 'https://datainsights.com/jobs',
        contact_email: 'careers@datainsights.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Advanced Manufacturing Co.',
        title: 'Product Engineer',
        description: 'Join our engineering team to design, develop, and improve manufacturing processes and products. Ideal candidates have experience in mechanical engineering and product development.',
        location: 'Austin, TX',
        is_remote: false,
        job_type: 'full-time',
        salary_min: 90000,
        salary_max: 120000,
        application_url: 'https://advmfg.com/careers',
        contact_email: 'jobs@advmfg.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        creator_id: mentorId,
        company_name: 'Creative Designs Studio',
        title: 'Senior Graphic Designer',
        description: 'We are looking for a creative and experienced graphic designer to join our team. You will work on various design projects for clients across different industries.',
        location: 'Los Angeles, CA',
        is_remote: false,
        job_type: 'full-time',
        salary_min: 80000,
        salary_max: 100000,
        application_url: 'https://creativedesigns.com/careers',
        contact_email: 'hr@creativedesigns.com',
        is_published: true,
        expires_at: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('Inserting job listings...');
    const { data: jobsData, error: jobsError } = await supabase
      .from('job_listings')
      .upsert(jobs)
      .select();
    
    if (jobsError) {
      console.error('Error inserting job listings:', jobsError);
    } else {
      console.log(`Successfully inserted ${jobsData.length} job listings`);
    }
    
    // Create mentorship programs
    const mentorshipPrograms = [
      {
        title: 'Career Kickstart Program',
        description: 'A six-month mentorship program designed to help recent graduates transition into their professional careers. Mentees will be matched with experienced professionals in their field of interest.',
        start_date: new Date().toISOString(),
        end_date: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        title: 'Leadership Development Initiative',
        description: 'This program focuses on developing leadership skills for mid-career professionals. Participants will receive guidance from senior leaders and executives.',
        start_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 7 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        title: 'Entrepreneurship Mentoring',
        description: 'Connect with successful entrepreneurs who can provide guidance on starting and growing your own business. Ideal for alumni interested in entrepreneurship.',
        start_date: new Date(now.getTime() + 2 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        title: 'Technical Career Advancement',
        description: 'A specialized program for technology professionals looking to advance their careers. Mentors include tech leaders from various industries.',
        start_date: new Date().toISOString(),
        end_date: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        title: 'Academic to Industry Transition',
        description: 'Designed for PhD graduates transitioning from academia to industry. Mentors will help navigate this career change and leverage academic skills in corporate settings.',
        start_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 7 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];
    
    console.log('Inserting mentorship programs...');
    const { data: programsData, error: programsError } = await supabase
      .from('mentorship_programs')
      .upsert(mentorshipPrograms)
      .select();
    
    if (programsError) {
      console.error('Error inserting mentorship programs:', programsError);
    } else {
      console.log(`Successfully inserted ${programsData.length} mentorship programs`);
    }
    
    // Get mentor and mentee profiles
    const mentorProfiles = profiles.filter(p => p.is_mentor);
    const menteeProfiles = profiles.filter(p => !p.is_mentor);
    
    if (mentorProfiles.length > 0 && menteeProfiles.length > 0 && programsData) {
      const mentorshipRelationships = [];
      
      // Create mentor-mentee relationships
      for (let i = 0; i < Math.min(8, mentorProfiles.length * menteeProfiles.length); i++) {
        const mentorIndex = i % mentorProfiles.length;
        const menteeIndex = i % menteeProfiles.length;
        const programIndex = i % programsData.length;
        
        mentorshipRelationships.push({
          program_id: programsData[programIndex].id,
          mentor_id: mentorProfiles[mentorIndex].id,
          mentee_id: menteeProfiles[menteeIndex].id,
          status: ['pending', 'active', 'completed'][i % 3]
        });
      }
      
      console.log('Inserting mentorship relationships...');
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('mentorship_relationships')
        .upsert(mentorshipRelationships)
        .select();
      
      if (relationshipsError) {
        console.error('Error inserting mentorship relationships:', relationshipsError);
      } else {
        console.log(`Successfully inserted ${relationshipsData.length} mentorship relationships`);
      }
    }
    
    console.log('Mock data insertion completed successfully!');
    
  } catch (error) {
    console.error('Error inserting mock data:', error);
  }
}

insertMockData(); 