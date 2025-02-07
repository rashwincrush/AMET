<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Alumni Network</h1>
        <p>Connect, Grow, and Inspire</p>
        <div class="hero-stats">
          <div class="stat">
            <h3>5,000+</h3>
            <p>Active Alumni</p>
          </div>
          <div class="stat">
            <h3>50+</h3>
            <p>Industries</p>
          </div>
          <div class="stat">
            <h3>80%</h3>
            <p>Employment Rate</p>
          </div>
        </div>
        <RouterLink to="/login" class="cta-button">
          Get Started <i class="fas fa-arrow-right"></i>
        </RouterLink>
      </div>
      <div class="hero-image">
        <img :src="alumniNetworkIllustration" alt="Alumni Network Illustration" />
      </div>
    </section>

    <section class="features">
      <div class="feature">
        <div class="feature-icon">
          <i class="fas fa-users"></i>
        </div>
        <h2>Network</h2>
        <p>Connect with alumni from your institution across various industries and locations.</p>
        <RouterLink to="/alumni" class="feature-link">Explore Alumni</RouterLink>
      </div>
      
      <div class="feature">
        <div class="feature-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <h2>Events</h2>
        <p>Stay informed about upcoming alumni events, workshops, and reunions.</p>
        <RouterLink to="/events" class="feature-link">View Events</RouterLink>
      </div>
      
      <div class="feature">
        <div class="feature-icon">
          <i class="fas fa-briefcase"></i>
        </div>
        <h2>Careers</h2>
        <p>Discover job opportunities and career insights shared by fellow alumni.</p>
        <RouterLink to="/jobs" class="feature-link">Browse Jobs</RouterLink>
      </div>
    </section>

    <section class="testimonials">
      <h2>What Our Alumni Say</h2>
      <div class="testimonial-grid">
        <div class="testimonial">
          <p>"This platform has been incredible for my professional growth and networking."</p>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Johnson" />
            <div>
              <h4>Sarah Johnson</h4>
              <p>Senior Software Engineer, Google</p>
            </div>
          </div>
        </div>
        <div class="testimonial">
          <p>"Found my dream job through connections made on this alumni network."</p>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="Michael Chen" />
            <div>
              <h4>Michael Chen</h4>
              <p>Data Scientist, Tesla</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import alumniNetworkIllustration from '@/assets/alumni-network.svg'
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  display: flex;
  align-items: center;
  gap: 4rem;
  margin-bottom: 4rem;
  background-color: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-content {
  flex: 1;
}

.hero h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat {
  text-align: center;
  background-color: #f4f6f9;
  padding: 1rem;
  border-radius: 8px;
  flex: 1;
}

.stat h3 {
  font-size: 2rem;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.stat p {
  color: #6b7280;
  margin: 0;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.cta-button:hover {
  background-color: #1d4ed8;
}

.hero-image {
  flex: 1;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

.features {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature {
  flex: 1;
  text-align: center;
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.feature h2 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.feature-link {
  display: inline-block;
  color: #2563eb;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s;
}

.feature-link:hover {
  color: #1d4ed8;
}

.testimonials {
  text-align: center;
}

.testimonials h2 {
  margin-bottom: 2rem;
  color: #1f2937;
}

.testimonial-grid {
  display: flex;
  gap: 2rem;
}

.testimonial {
  flex: 1;
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.testimonial p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-author h4 {
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.testimonial-author p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}
</style>
