<!-- <template>
  <div id="app">
    <nav>
      <div class="navigation">
        <router-link to="/homepage">Home</router-link> |
        <router-link to="/log-in">Log In</router-link> |
        <router-link to="/RegisterPage">Register</router-link> |
        <router-link v-if="user" to="/create-event">Create Event</router-link>
      </div>
      <div class="user_icon">
        <span v-if="user">Welcome, {{ user.displayName || user.email }}</span>
        <i v-else class="fas fa-user-circle"></i>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'App',
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
  },
};
</script>

<style>
nav {
  text-align: center;
  margin-bottom: 20px;
}
router-link {
  margin: 0 10px;
}

.user_icon {
  position: absolute;
  right: 20px; 
  font-size: 1.2rem;
  cursor: pointer;
}

.user_icon span {
  margin-right: 10px;
  font-size: 1rem;
  font-weight: bold;
}

.user_icon i {
  font-size: 2.6rem;
}

.user_icon:hover {
  color: #ffffffa0;
}
</style> -->

<template>
  <div id="app">
    <nav>
      <div class="navigation">
        <router-link to="/homepage">Home</router-link> |
        <router-link to="/log-in">Log In</router-link> |
        <router-link to="/RegisterPage">Register</router-link> |
        <router-link v-if="userName !== 'Anonymous'" to="/create-event">Create Event</router-link>
      </div>
      <div class="user_icon">
        <i class="fas fa-user-circle"></i>
        <span v-if="userName">{{ userName }}</span>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  name: "App",
  data() {
    return {
      userName: "Anonymous",
    };
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.userName = `${userData.firstName} ${userData.lastName}`;
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
  },
};
</script>

<style>
nav {
  text-align: center;
  margin-bottom: 20px;
}
router-link {
  margin: 0 10px;
}
.user_icon {
  position: absolute;
  right: 20px;
  font-size: 2.6rem;
  cursor: pointer;
}
.user_icon span {
  margin-left: 10px;
  font-size: 1rem;
}
</style>
