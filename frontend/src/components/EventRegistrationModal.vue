<template>
  <div class="event-registration-modal" v-if="isVisible">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">×</button>
      <h2>Register for {{ event.title }}</h2>
      
      <form @submit.prevent="submitRegistration">
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              v-model="registrationForm.fullName" 
              required 
              placeholder="Enter your full name"
            >
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="registrationForm.email" 
              required 
              placeholder="Enter your email"
            >
          </div>
          
          <div class="form-group">
            <label>Graduation Year</label>
            <select v-model="registrationForm.graduationYear" required>
              <option v-for="year in graduationYears" :key="year">{{ year }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Department</label>
            <select v-model="registrationForm.department" required>
              <option v-for="dept in departments" :key="dept">{{ dept }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-group full-width">
          <label>Additional Notes</label>
          <textarea 
            v-model="registrationForm.notes" 
            placeholder="Any special requirements or comments?"
          ></textarea>
        </div>
        
        <div class="ticket-options">
          <div class="ticket-type" v-for="ticket in event.ticketTypes" :key="ticket.type">
            <input 
              type="radio" 
              :id="ticket.type" 
              :value="ticket.type" 
              v-model="registrationForm.ticketType"
            >
            <label :for="ticket.type">
              {{ ticket.type }} - ${{ ticket.price }}
            </label>
          </div>
        </div>
        
        <div class="registration-summary">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> {{ event.date }}</p>
          <p><strong>Time:</strong> {{ event.time }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
        </div>
        
        <button type="submit" class="submit-btn">
          Complete Registration
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'register'])

const isVisible = ref(true)
const registrationForm = reactive({
  fullName: '',
  email: '',
  graduationYear: null,
  department: '',
  notes: '',
  ticketType: null
})

const graduationYears = Array.from(
  { length: new Date().getFullYear() - 1990 + 1 }, 
  (_, i) => 1990 + i
).reverse()

const departments = [
  'Computer Science',
  'Engineering',
  'Business',
  'Design',
  'Data Science',
  'Marketing',
  'Other'
]

function closeModal() {
  isVisible.value = false
  emit('close')
}

function submitRegistration() {
  // Validate form
  if (!registrationForm.ticketType) {
    alert('Please select a ticket type')
    return
  }

  // Emit registration data
  emit('register', {
    eventId: props.event.id,
    registrationData: { ...registrationForm }
  })

  // Close modal
  closeModal()
}
</script>

<style scoped>
.event-registration-modal {
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
  font-family: 'Inter', sans-serif;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

h2 {
  color: #1f2937;
  margin-bottom: 20px;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  margin-bottom: 5px;
  color: #4b5563;
  font-weight: 500;
}

input, select, textarea {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.ticket-options {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.ticket-type {
  display: flex;
  align-items: center;
}

.ticket-type input {
  margin-right: 10px;
}

.registration-summary {
  background-color: #f4f6f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #2563eb;
}
</style>
