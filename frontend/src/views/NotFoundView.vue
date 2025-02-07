<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #3aa876;
}
</style>
