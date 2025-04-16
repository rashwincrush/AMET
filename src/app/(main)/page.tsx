import Link from 'next/link';
import '../enhanced-landing-page.css';

interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'events' | 'testimonials' | 'stats' | 'cta';
  enabled: boolean;
  order?: number;
  title?: string;
  subtitle?: string;
  content?: string;
  layout?: 'centered' | 'left' | 'right';
  _enabled?: boolean;
  _id?: string;
  _type?: string;
}

// Section components
const HeroSection = ({ title, subtitle, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="hero-section">
    <div className="hero-content">
      <div className={`container mx-auto ${layout === 'centered' ? 'text-center' : ''}`}>
        <h1 className="hero-title">{title || 'Welcome to Alumni Network'}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        <div className="hero-buttons">
          <Link 
            href="/register" 
            className="btn btn-primary"
          >
            Register
          </Link>
          <Link 
            href="/login" 
            className="btn btn-outline-primary ms-2"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection = ({ title, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="features-section">
    <div className={`container mx-auto ${layout === 'centered' ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold mb-12">{title || 'Key Features'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="feature-card">
          <div className="feature-icon bg-blue-100 text-blue-600 p-3 rounded-lg">
            <i className="fas fa-users"></i>
          </div>
          <h3 className="mt-4 text-xl font-semibold">Network</h3>
          <p className="mt-2 text-gray-600">Connect with alumni from your university.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon bg-green-100 text-green-600 p-3 rounded-lg">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h3 className="mt-4 text-xl font-semibold">Mentorship</h3>
          <p className="mt-2 text-gray-600">Find mentors and mentees for career guidance.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon bg-yellow-100 text-yellow-600 p-3 rounded-lg">
            <i className="fas fa-briefcase"></i>
          </div>
          <h3 className="mt-4 text-xl font-semibold">Opportunities</h3>
          <p className="mt-2 text-gray-600">Discover job openings and career opportunities.</p>
        </div>
      </div>
      <p className="mt-8 text-lg text-gray-600 dark:text-gray-400">
        Join our vibrant community of alumni and students.
      </p>
    </div>
  </section>
);

const EventsSection = ({ title, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="events-section">
    <div className={`container mx-auto ${layout === 'centered' ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold mb-12">{title || 'Upcoming Events'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="event-card">
          <div className="event-image">
            <img src="/images/event1.jpg" alt="Alumni Networking" className="w-full h-48 object-cover" />
          </div>
          <div className="event-content p-4 bg-white rounded-b-lg shadow">
            <h3 className="text-xl font-semibold">Alumni Networking Night</h3>
            <p className="text-gray-600">Join us for an evening of networking with alumni from various industries.</p>
            <div className="mt-4 flex items-center">
              <i className="fas fa-calendar-alt text-yellow-500 mr-2"></i>
              <span>April 15, 2025</span>
            </div>
          </div>
        </div>
        <div className="event-card">
          <div className="event-image">
            <img src="/images/event2.jpg" alt="Career Fair" className="w-full h-48 object-cover" />
          </div>
          <div className="event-content p-4 bg-white rounded-b-lg shadow">
            <h3 className="text-xl font-semibold">Virtual Career Fair</h3>
            <p className="text-gray-600">Connect with companies and explore job opportunities.</p>
            <div className="mt-4 flex items-center">
              <i className="fas fa-calendar-alt text-yellow-500 mr-2"></i>
              <span>May 1, 2025</span>
            </div>
          </div>
        </div>
        <div className="event-card">
          <div className="event-image">
            <img src="/images/event3.jpg" alt="Alumni Panel" className="w-full h-48 object-cover" />
          </div>
          <div className="event-content p-4 bg-white rounded-b-lg shadow">
            <h3 className="text-xl font-semibold">Alumni Panel Discussion</h3>
            <p className="text-gray-600">Learn from successful alumni about their career journeys.</p>
            <div className="mt-4 flex items-center">
              <i className="fas fa-calendar-alt text-yellow-500 mr-2"></i>
              <span>May 15, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = ({ title, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="py-16 bg-gray-50 dark:bg-gray-800">
    <div className={`container mx-auto px-4 ${layout === 'centered' ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold mb-12">{title || 'Alumni Stories'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="testimonial-card p-6 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            &quot;The alumni network has been instrumental in my career growth. The mentorship program helped me navigate my early career challenges.&quot;
          </p>
          <div className="testimonial-author flex items-center">
            <img 
              src="/images/testimonial1.jpg" 
              alt="John Doe" 
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-gray-600">Class of 2020</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card p-6 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            &quot;I found my dream job through the alumni network. The career resources and connections were invaluable.&quot;
          </p>
          <div className="testimonial-author flex items-center">
            <img 
              src="/images/testimonial2.jpg" 
              alt="Jane Smith" 
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold">Jane Smith</h3>
              <p className="text-sm text-gray-600">Class of 2018</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card p-6 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            &quot;The mentorship program helped me transition into a leadership role. I&apos;m now mentoring the next generation.&quot;
          </p>
          <div className="testimonial-author flex items-center">
            <img 
              src="/images/testimonial3.jpg" 
              alt="Mike Johnson" 
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold">Mike Johnson</h3>
              <p className="text-sm text-gray-600">Class of 2015</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const StatsSection = ({ title, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="py-16">
    <div className={`container mx-auto px-4 ${layout === 'centered' ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold mb-12">{title || 'Alumni Impact'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="stat-card p-6 bg-white rounded-lg shadow">
          <div className="stat-icon bg-blue-100 text-blue-600 p-3 rounded-lg">
            <i className="fas fa-users"></i>
          </div>
          <h3 className="text-3xl font-bold mt-4">10,000+</h3>
          <p className="text-gray-600">Alumni Members</p>
        </div>
        <div className="stat-card p-6 bg-white rounded-lg shadow">
          <div className="stat-icon bg-green-100 text-green-600 p-3 rounded-lg">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h3 className="text-3xl font-bold mt-4">500+</h3>
          <p className="text-gray-600">Mentorship Matches</p>
        </div>
        <div className="stat-card p-6 bg-white rounded-lg shadow">
          <div className="stat-icon bg-yellow-100 text-yellow-600 p-3 rounded-lg">
            <i className="fas fa-briefcase"></i>
          </div>
          <h3 className="text-3xl font-bold mt-4">1,000+</h3>
          <p className="text-gray-600">Job Placements</p>
        </div>
        <div className="stat-card p-6 bg-white rounded-lg shadow">
          <div className="stat-icon bg-purple-100 text-purple-600 p-3 rounded-lg">
            <i className="fas fa-handshake"></i>
          </div>
          <h3 className="text-3xl font-bold mt-4">200+</h3>
          <p className="text-gray-600">Networking Events</p>
        </div>
      </div>
    </div>
  </section>
);

const CtaSection = ({ title, content, layout, _enabled, _id, _type }: LandingPageSection) => (
  <section className="cta-section bg-gradient-to-r from-blue-600 to-blue-800 text-white">
    <div className={`container mx-auto ${layout === 'centered' ? 'text-center' : ''} px-4 py-16`}>
      <h2 className="text-3xl font-bold mb-4">{title || 'Join Our Community'}</h2>
      <p className="text-lg mb-8">{content || 'Connect with alumni, find mentorship opportunities, and explore career paths.'}</p>
      <div className="flex justify-center">
        <Link 
          href="/register" 
          className="btn btn-primary text-white bg-white hover:bg-gray-100 text-blue-600 hover:text-blue-800"
        >
          Get Started
        </Link>
      </div>
    </div>
  </section>
);

// Define section interface
interface Section {
  id: string;
  type: 'hero' | 'features' | 'events' | 'testimonials' | 'stats' | 'cta';
  enabled: boolean;
  order: number;
  component: React.ComponentType<LandingPageSection>;
  title?: string;
  subtitle?: string;
  content?: string;
  layout?: 'centered' | 'left' | 'right';
}

// Define sections
const sections: Section[] = [
  {
    id: 'hero-section',
    type: 'hero',
    enabled: true,
    order: 1,
    component: HeroSection,
    title: 'Welcome to Alumni Network',
    subtitle: 'Connect with fellow alumni, find opportunities, and stay connected',
    layout: 'centered'
  },
  {
    id: 'features-section',
    type: 'features',
    enabled: true,
    order: 2,
    component: FeaturesSection,
    title: 'Key Features',
    layout: 'centered'
  },
  {
    id: 'events-section',
    type: 'events',
    enabled: true,
    order: 3,
    component: EventsSection,
    title: 'Upcoming Events',
    layout: 'centered'
  },
  {
    id: 'testimonials-section',
    type: 'testimonials',
    enabled: true,
    order: 4,
    component: TestimonialsSection,
    title: 'Alumni Stories',
    layout: 'centered'
  },
  {
    id: 'stats-section',
    type: 'stats',
    enabled: true,
    order: 5,
    component: StatsSection,
    title: 'Alumni Impact',
    layout: 'centered'
  },
  {
    id: 'cta-section',
    type: 'cta',
    enabled: true,
    order: 6,
    component: CtaSection,
    title: 'Join Our Community',
    content: 'Connect with alumni, find mentorship opportunities, and explore career paths.',
    layout: 'centered'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {sections
        .filter(section => section.enabled)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(section => {
          const Component = section.component;
          return <Component key={section.id} {...section} />;
        })}
    </main>
  );
}