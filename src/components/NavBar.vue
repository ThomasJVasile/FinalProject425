<template>
    <nav>
      <div>
        <a href="/">Home</a>
        <a href="/create-event">Create Event</a>
      </div>
      <div v-if="user">
        <span>Welcome, {{ user.displayName || user.email }}</span>
      </div>
    </nav>
  </template>
  
  <script>
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { ref, onMounted } from 'vue';
  
  export default {
    name: 'NavBar',
    setup() {
      const user = ref(null);
      const auth = getAuth();
  
      onMounted(() => {
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            user.value = currentUser;
          } else {
            user.value = null;
          }
        });
      });
  
      return { user };
    }
  };
  </script>
  
  <style scoped>
  nav {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #f5f5f5;
  }
  a {
    margin-right: 15px;
    text-decoration: none;
    color: #333;
  }
  </style>
  