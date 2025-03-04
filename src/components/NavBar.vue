<template>
  <nav>
    <div class="nav-left">
      <router-link to="/homepage" class="nav-link">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/create-event" class="nav-link">
        <i class="fas fa-plus-circle"></i>
        <span>Create Event</span>
      </router-link>
      <router-link to="/search-users" class="nav-link">
        <i class="fas fa-search"></i>
        <span>Find People</span>
      </router-link>
      <router-link to="/friend-requests" class="nav-link">
        <i class="fas fa-user-friends"></i>
        <span>Friend Requests</span>
      </router-link>
    </div>
    <div class="nav-right" v-if="user">
      <router-link to="/UserProfilePage" class="nav-link user-profile">
        <span>{{ user.displayName || user.email }}</span>
        <i class="fas fa-user-circle"></i>
      </router-link>
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
  align-items: center;
  padding: 12px 24px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  text-decoration: none;
  color: #1a1a1a;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f0f2f5;
  color: #1877f2;
}

.nav-link i {
  font-size: 1.2rem;
}

.user-profile {
  background-color: #f0f2f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.user-profile:hover {
  background-color: #e4e6eb;
}
</style>
  