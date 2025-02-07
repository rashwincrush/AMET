<template>
  <div class="events-container">
    <div class="events-header">
      <h1>Alumni Events</h1>
      <div class="events-stats">
        <div class="stat-card">
          <h3>{{ upcomingEventsCount }}</h3>
          <p>Upcoming Events</p>
        </div>
        <div class="stat-card">
          <h3>{{ pastEventsCount }}</h3>
          <p>Past Events</p>
        </div>
        <div class="stat-card">
          <h3>{{ totalParticipants }}</h3>
          <p>Total Participants</p>
        </div>
      </div>
    </div>

    <div class="events-filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search events by name or type"
      >
      <select v-model="selectedEventType">
        <option value="">All Event Types</option>
        <option v-for="type in eventTypes" :key="type">{{ type }}</option>
      </select>
      <select v-model="selectedMonth">
        <option value="">All Months</option>
        <option v-for="month in months" :key="month">{{ month }}</option>
      </select>
      <button @click="goToHome">Back</button>
    </div>

    <div class="featured-event" v-if="featuredEvent">
      <div class="featured-event-content">
        <div class="featured-event-image">
          <img :src="featuredEvent.image" :alt="featuredEvent.title">
        </div>
        <div class="featured-event-details">
          <span class="featured-badge">Featured Event</span>
          <h2>{{ featuredEvent.title }}</h2>
          <p>{{ featuredEvent.description }}</p>
          <div class="event-meta">
            <span>
              <i class="fas fa-calendar"></i> {{ featuredEvent.date }}
            </span>
            <span>
              <i class="fas fa-map-marker-alt"></i> {{ featuredEvent.location }}
            </span>
          </div>
          <button 
            class="register-btn" 
            @click="openRegistrationModal(featuredEvent)"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>

    <div class="events-grid">
      <div 
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="event-card"
      >
        <div class="event-card-image">
          <img :src="event.image" :alt="event.title">
          <span class="event-type-badge">{{ event.type }}</span>
        </div>
        <div class="event-card-details">
          <h3>{{ event.title }}</h3>
          <div class="event-details">
            <span>
              <i class="fas fa-calendar"></i> {{ event.date }}
            </span>
            <span>
              <i class="fas fa-map-marker-alt"></i> {{ event.location }}
            </span>
          </div>
          <p>{{ event.shortDescription }}</p>
          <button 
            class="register-btn" 
            @click="openRegistrationModal(event)"
          >
            Register
          </button>
        </div>
      </div>
    </div>

    <EventRegistrationModal 
      v-if="selectedEvent" 
      :event="selectedEvent"
      @close="closeRegistrationModal"
      @register="submitRegistration"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import EventRegistrationModal from '@/components/EventRegistrationModal.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedEventType = ref('')
const selectedMonth = ref('')

const eventTypes = [
  'Networking', 'Workshop', 'Career Fair', 
  'Seminar', 'Conference', 'Social Event'
]

const months = [
  'January', 'February', 'March', 'April', 
  'May', 'June', 'July', 'August', 
  'September', 'October', 'November', 'December'
]

const events = ref([
  {
    id: 1,
    title: 'AI & Machine Learning Workshop',
    type: 'Workshop',
    date: 'February 20, 2025',
    time: '10:00 AM - 4:00 PM PST',
    location: 'Silicon Valley, CA',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Deep dive into the latest AI and Machine Learning trends.',
    description: 'A comprehensive workshop exploring cutting-edge AI technologies, machine learning algorithms, and their real-world applications.',
    ticketTypes: [
      { type: 'Standard', price: 50 },
      { type: 'Premium', price: 100 }
    ]
  },
  {
    id: 2,
    title: 'Spring Career Fair 2025',
    type: 'Career Fair',
    date: 'March 10, 2025',
    time: '9:00 AM - 5:00 PM PST',
    location: 'Online Event',
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Connect with top tech companies and explore job opportunities.',
    description: 'An exclusive online career fair featuring top tech companies, networking sessions, and direct recruitment opportunities.',
    ticketTypes: [
      { type: 'Attendee', price: 25 },
      { type: 'Recruiter', price: 200 }
    ]
  },
  {
    id: 3,
    title: 'Tech Leadership Summit',
    type: 'Conference',
    date: 'April 15, 2025',
    time: '8:00 AM - 6:00 PM PST',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Learn from industry leaders about tech management and leadership.',
    description: 'Join top tech executives and thought leaders for a day of insights, networking, and leadership development.',
    ticketTypes: [
      { type: 'Early Bird', price: 150 },
      { type: 'Regular', price: 250 },
      { type: 'VIP', price: 500 }
    ]
  }
])

const selectedEvent = ref(null)

const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !selectedEventType.value || event.type === selectedEventType.value
    const matchesMonth = !selectedMonth.value || event.date.includes(selectedMonth.value)
    
    return matchesSearch && matchesType && matchesMonth
  })
})

const featuredEvent = computed(() => events.value[0])

const upcomingEventsCount = computed(() => events.value.length)
const pastEventsCount = computed(() => 5)  // Mock data
const totalParticipants = computed(() => 500)  // Mock data

function openRegistrationModal(event) {
  selectedEvent.value = event
}

function closeRegistrationModal() {
  selectedEvent.value = null
}

function submitRegistration(registrationData) {
  // Placeholder for registration submission logic
  console.log('Registration submitted:', registrationData)
  alert('Registration successful!')
  closeRegistrationModal()
}

const goToHome = () => {
  router.push('/')
}

// Add keyboard event listener to close modal with Esc key
const handleEscKey = (event) => {
  if (event.key === 'Escape' && selectedEvent.value) {
    closeRegistrationModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})
</script>

<style scoped>
.events-container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
}

.events-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
}

.events-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #2563eb;
  font-size: 24px;
  margin-bottom: 5px;
}

.events-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.events-filters input,
.events-filters select {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex: 1;
}

.events-filters button {
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #2563eb;
  color: white;
  cursor: pointer;
}

.featured-event {
  margin-bottom: 40px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.featured-event-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.featured-event-image {
  height: 400px;
  overflow: hidden;
}

.featured-event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-event-details {
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-badge {
  background-color: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 15px;
}

.featured-event-details h2 {
  margin: 0 0 15px;
  color: #1f2937;
  font-size: 1.8rem;
}

.event-meta {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  color: #6b7280;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.event-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-card-image {
  position: relative;
  height: 200px;
}

.event-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #2563eb;
}

.event-card-details {
  padding: 20px;
}

.event-card-details h3 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 1.2rem;
}

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
  color: #6b7280;
}

.event-details span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.register-btn {
  width: 100%;
  padding: 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 15px;
}

.register-btn:hover {
  background-color: #1d4ed8;
}
</style>
