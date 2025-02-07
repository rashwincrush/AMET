<template>
  <div class="alumni-container">
    <div class="alumni-header">
      <h1>Alumni Network</h1>
      <div class="alumni-stats">
        <div class="stat-card">
          <h3>{{ totalAlumni }}</h3>
          <p>Total Alumni</p>
        </div>
        <div class="stat-card">
          <h3>{{ industriesRepresented }}</h3>
          <p>Industries</p>
        </div>
        <div class="stat-card">
          <h3>{{ countriesRepresented }}</h3>
          <p>Countries</p>
        </div>
      </div>
    </div>

    <div class="alumni-content">
      <div class="alumni-filters">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search alumni by name, company, or department"
        >
        <select v-model="selectedBatch">
          <option value="">All Batches</option>
          <option v-for="batch in graduationYears" :key="batch">{{ batch }}</option>
        </select>
        <select v-model="selectedDepartment">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept">{{ dept }}</option>
        </select>
        <button @click="goToHome" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>

      <div class="alumni-grid">
        <div 
          v-for="alumni in filteredAlumni" 
          :key="alumni.id" 
          class="alumni-card"
          @click="openChatWithAlumni(alumni)"
        >
          <div class="alumni-card-header">
            <img :src="alumni.profilePicture" :alt="alumni.name" class="alumni-profile-pic">
            <div class="alumni-info">
              <h3>{{ alumni.name }}</h3>
              <p>{{ alumni.currentJob }} at {{ alumni.company }}</p>
            </div>
          </div>
          
          <div class="alumni-card-details">
            <div class="alumni-meta">
              <span>
                <i class="fas fa-graduation-cap"></i> {{ alumni.graduationYear }}
              </span>
              <span>
                <i class="fas fa-building"></i> {{ alumni.department }}
              </span>
            </div>
            
            <button class="chat-btn">
              <i class="fas fa-comment"></i> Chat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <div 
      v-if="selectedAlumni" 
      class="chat-modal"
    >
      <div class="chat-modal-content">
        <div class="chat-header">
          <img :src="selectedAlumni.profilePicture" :alt="selectedAlumni.name" class="chat-profile-pic">
          <div class="chat-header-info">
            <h3>{{ selectedAlumni.name }}</h3>
            <p>{{ selectedAlumni.currentJob }} at {{ selectedAlumni.company }}</p>
          </div>
          <button class="close-chat-btn" @click="closeChatModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="(message, index) in chatMessages" 
            :key="index"
            :class="['message', message.sender === 'me' ? 'sent' : 'received']"
          >
            <img 
              v-if="message.sender !== 'me'" 
              :src="selectedAlumni.profilePicture" 
              alt="Alumni Profile"
              class="message-profile-pic"
            >
            <div class="message-content">
              {{ message.text }}
              <span class="message-time">{{ message.time }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input 
            type="text" 
            v-model="newMessage" 
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
          >
          <button @click="sendMessage" class="send-btn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref('')
const selectedBatch = ref('')
const selectedDepartment = ref('')
const selectedAlumni = ref(null)
const newMessage = ref('')
const chatMessages = ref([])

const graduationYears = Array.from(
  { length: new Date().getFullYear() - 1990 + 1 }, 
  (_, i) => 1990 + i
).reverse()

const departments = [
  'Computer Science', 'Engineering', 'Business', 
  'Design', 'Data Science', 'Marketing'
]

const alumniList = ref([
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    graduationYear: 2023, 
    department: 'Computer Science', 
    currentJob: 'Senior Software Engineer', 
    company: 'Google',
    profilePicture: 'https://randomuser.me/api/portraits/women/79.jpg'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    graduationYear: 2022, 
    department: 'Data Science', 
    currentJob: 'Data Scientist', 
    company: 'Tesla',
    profilePicture: 'https://randomuser.me/api/portraits/men/85.jpg'
  },
  { 
    id: 3, 
    name: 'Emily Rodriguez', 
    graduationYear: 2021, 
    department: 'Business', 
    currentJob: 'Product Manager', 
    company: 'Airbnb',
    profilePicture: 'https://randomuser.me/api/portraits/women/50.jpg'
  }
])

const filteredAlumni = computed(() => {
  return alumniList.value.filter(alumni => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      alumni.department.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesBatch = !selectedBatch.value || alumni.graduationYear.toString() === selectedBatch.value
    const matchesDepartment = !selectedDepartment.value || alumni.department === selectedDepartment.value
    
    return matchesSearch && matchesBatch && matchesDepartment
  })
})

const totalAlumni = computed(() => alumniList.value.length)
const industriesRepresented = computed(() => 15)  // Mock data
const countriesRepresented = computed(() => 10)  // Mock data

function openChatWithAlumni(alumni) {
  selectedAlumni.value = alumni
  chatMessages.value = [
    { 
      sender: alumni.name, 
      text: `Hi there! I'm ${alumni.name}, a ${alumni.currentJob} at ${alumni.company}.`, 
      time: '9:30 AM' 
    }
  ]
}

function closeChatModal() {
  selectedAlumni.value = null
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  // Add user's message
  chatMessages.value.push({
    sender: 'me',
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  // Simulate AI/Alumni response
  setTimeout(() => {
    chatMessages.value.push({
      sender: selectedAlumni.value.name,
      text: `Thanks for reaching out! I'd be happy to chat more about ${selectedAlumni.value.currentJob} at ${selectedAlumni.value.company}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }, 1000)

  newMessage.value = ''
}

const handleEscKey = (event) => {
  if (event.key === 'Escape' && selectedAlumni.value) {
    closeChatModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.alumni-container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
}

.alumni-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
}

.alumni-stats {
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

.alumni-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alumni-filters input,
.alumni-filters select {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex: 1;
}

.back-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.alumni-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.alumni-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.alumni-card:hover {
  transform: translateY(-2px);
}

.alumni-card-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f4f6f9;
}

.alumni-profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.alumni-info h3 {
  margin: 0 0 5px;
  color: #1f2937;
}

.alumni-info p {
  margin: 0;
  color: #6b7280;
}

.alumni-card-details {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alumni-meta {
  display: flex;
  gap: 15px;
  color: #6b7280;
}

.alumni-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.chat-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-btn:hover {
  background-color: #1d4ed8;
}

.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f4f6f9;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
}

.chat-profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.chat-header-info h3 {
  margin: 0 0 5px;
  color: #1f2937;
}

.chat-header-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.close-chat-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-profile-pic {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  position: relative;
}

.message.sent .message-content {
  background-color: #2563eb;
  color: white;
  align-self: flex-end;
}

.message.received .message-content {
  background-color: #f4f6f9;
  color: #1f2937;
  align-self: flex-start;
}

.message-time {
  position: absolute;
  bottom: -15px;
  font-size: 0.7rem;
  color: #6b7280;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: #f4f6f9;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.chat-input input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-right: 10px;
}

.send-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
