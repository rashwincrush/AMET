<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-illustration">
        <img :src="loginIllustration" alt="Login Illustration" />
      </div>
      <div class="login-form-wrapper">
        <form @submit.prevent="login" class="login-form">
          <div class="form-header">
            <h2>Welcome Back</h2>
            <p>Log in to your Alumni Network account</p>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                required 
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                required 
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-login">
              Login <i class="fas fa-sign-in-alt"></i>
            </button>
            <div class="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>
          </div>
          
          <div class="social-login">
            <p>Or continue with</p>
            <div class="social-buttons">
              <button type="button" class="social-btn google">
                <i class="fab fa-google"></i> Google
              </button>
              <button type="button" class="social-btn linkedin">
                <i class="fab fa-linkedin"></i> LinkedIn
              </button>
            </div>
          </div>
          
          <div class="signup-link">
            <p>Don't have an account? 
              <RouterLink to="/register">Sign Up</RouterLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import loginIllustration from '@/assets/login-illustration.svg'

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const login = () => {
  // Implement login logic
  console.log('Login attempt', { email: email.value, password: password.value })
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.login-container {
  display: flex;
  width: 1000px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-illustration {
  flex: 1;
  background-color: #f4f6f9;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-illustration img {
  max-width: 100%;
  height: auto;
}

.login-form-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6b7280;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  color: #6b7280;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2563eb;
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-login:hover {
  background-color: #1d4ed8;
}

.forgot-password a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password a:hover {
  color: #2563eb;
}

.social-login {
  text-align: center;
  margin-bottom: 1.5rem;
}

.social-login p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.social-btn i {
  font-size: 1.2rem;
}

.social-btn.google {
  color: #db4437;
}

.social-btn.linkedin {
  color: #0077b5;
}

.social-btn:hover {
  background-color: #f4f6f9;
  border-color: #d1d5db;
}

.signup-link {
  text-align: center;
  color: #6b7280;
}

.signup-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s;
}

.signup-link a:hover {
  color: #1d4ed8;
}
</style>
