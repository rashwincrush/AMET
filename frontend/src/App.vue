<template>
  <div id="app">
    <header class="main-header">
      <div class="logo">
        <img :src="logo" alt="Alumni Management SaaS" />
        <h1>Alumni Network</h1>
      </div>
      <nav v-if="isAuthenticated" class="main-nav">
        <RouterLink to="/" class="nav-item" exact-active-class="active">
          <i class="fas fa-home"></i> Home
        </RouterLink>
        <RouterLink to="/alumni" class="nav-item" active-class="active">
          <i class="fas fa-users"></i> Alumni
        </RouterLink>
        <RouterLink to="/events" class="nav-item" active-class="active">
          <i class="fas fa-calendar-alt"></i> Events
        </RouterLink>
        <RouterLink to="/jobs" class="nav-item" active-class="active">
          <i class="fas fa-briefcase"></i> Jobs
        </RouterLink>
      </nav>
      <div v-if="isAuthenticated" class="user-actions">
        <div class="user-profile">
          <img :src="userProfilePicture" alt="Profile" class="profile-pic" />
          <span>{{ userName }}</span>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="main-footer">
      <div class="footer-content">
        <p>&copy; 2025 Alumni Management SaaS. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import logo from '@/assets/logo.svg'

const isAuthenticated = ref(true)
const userName = ref('John Doe')
const userProfilePicture = ref('https://randomuser.me/api/portraits/men/32.jpg')

const router = useRouter()

const logout = () => {
  isAuthenticated.value = false
  router.push('/login')
}

// Simulated authentication check
const checkAuthentication = () => {
  // In a real app, this would check for a valid token
  const token = localStorage.getItem('authToken')
  isAuthenticated.value = !!token
}

// Call on component mount
checkAuthentication()
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  background-color: #f4f6f9;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo img {
  height: 50px;
  width: 50px;
  object-fit: contain;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  text-decoration: none;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background-color: #f4f6f9;
  color: #2563eb;
}

.nav-item.active {
  background-color: #2563eb;
  color: white;
}

.nav-item i {
  margin-right: 0.5rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
}

.main-footer {
  background-color: #1f2937;
  color: white;
  padding: 1.5rem 2rem;
  text-align: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}
</style>
