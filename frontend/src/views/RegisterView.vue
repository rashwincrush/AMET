<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <form @submit.prevent="register" class="register-form">
        <h2>Create an Account</h2>
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            type="text"
            id="name"
            v-model="name"
            required
            placeholder="Enter your full name"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Enter your password"
            >
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="graduationYear">Graduation Year</label>
          <select
            id="graduationYear"
            v-model="graduationYear"
            required
          >
            <option value="">Select Year</option>
            <option 
              v-for="year in graduationYears" 
              :key="year" 
              :value="year"
            >
              {{ year }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="department">Department</label>
          <select
            id="department"
            v-model="department"
            required
          >
            <option value="">Select Department</option>
            <option 
              v-for="dept in departments" 
              :key="dept" 
              :value="dept"
            >
              {{ dept }}
            </option>
          </select>
        </div>

        <button type="submit" class="register-btn">
          Create Account
        </button>

        <p class="login-link">
          Already have an account? 
          <RouterLink to="/login">Login here</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const graduationYear = ref('')
const department = ref('')
const showPassword = ref(false)

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
  'Marketing'
]

const register = () => {
  // Here you would typically make an API call to register the user
  console.log('Registration data:', {
    name: name.value,
    email: email.value,
    password: password.value,
    graduationYear: graduationYear.value,
    department: department.value
  })
  
  // For now, just redirect to login
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background-color: #f4f6f9;
}

.register-form-wrapper {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-form h2 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #4b5563;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.register-btn {
  background-color: #2563eb;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-btn:hover {
  background-color: #1d4ed8;
}

.login-link {
  text-align: center;
  color: #6b7280;
}

.login-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
