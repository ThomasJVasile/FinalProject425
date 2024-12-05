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
      <div class="title"> 
        Get Together
      </div>
      <div class="navigation">
        <router-link to="/homepage">Home</router-link> |
        <router-link to="/log-in">Log In</router-link> |
        <router-link to="/RegisterPage">Register</router-link> |
        <router-link v-if="userName !== 'Anonymous'" to="/create-event">Create Event</router-link>
      </div>
      <div class="icons">
        <div class="inbox_icon" 
        v-if="userName !== 'Anonymous'" 
        @click="GoToInbox">
          <i class="fas fa-envelope"></i>
        </div>
        <div class="user_icon" @click="ToggleDropdown">
          <i class="fas fa-user-circle"></i>
          <span v-if="userName">{{ userName }}</span>
          <div v-if="IsDropdownVisible" class="dropdown-menu">
            <button @click="signOut">Sign Out</button>
          </div>
        </div>
      </div>

    </nav>
    <router-view />
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  name: "App",
  data() {
    return {
      userName: "Anonymous",
      IsDropdownVisible: false,     // make drop down invisible
    };
  },
  methods: {
    ToggleDropdown() {
      this.IsDropdownVisible = !this.IsDropdownVisible;
    },
    async signOut() {
      try {
        const auth = getAuth();
        await signOut(auth);
        this.userName = "Anonymous";
        this.IsDropdownVisible = false;
      } catch (error) {
        console.error("Sign out error: ", error);
        }
      },
    
    GoToInbox() {
        this.$router.push('/UserInboxPage');
      },
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
  display: flex;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: rgba(126, 231, 173, 0.53);
  padding: 1.25rem 20px;
}

.icons {
  display: flex;
  align-items: center;
}

.inbox_icon {
  margin-bottom: 6px;
  margin-right: 34px;
  font-size: 1.75rem;
  cursor: pointer;
}

.inbox_icon i {
  color: rgb(0, 0, 0)0;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-left: 2px;
}

.navigation a {
  margin: 0 10px;
}
.user_icon {
  margin-top: -7px;
  right: 20px;
  font-size: 2.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%; 
  left: 0;
  background-color: rgb(182, 243, 230);
  border: 1px solid #000000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0;
  z-index: 10;
}

.dropdown-menu button {
  background: none;
  border: none;

  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  display: block;
}


.user_icon span {
  margin-left: 10px;
  font-size: 1rem;
}
</style>
