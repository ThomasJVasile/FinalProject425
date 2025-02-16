<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Get Together</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/homepage">Home</v-btn>
      <v-btn v-if="userName === 'Anonymous'" text to="/log-in">Log In</v-btn>
      <v-btn v-if="userName === 'Anonymous'" text to="/RegisterPage">Register</v-btn>
      <v-btn v-if="userName !== 'Anonymous'" text to="/create-event">Create Event</v-btn>

      <v-menu v-model="menuVisible" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="toggleMenu">
            <v-avatar v-if="avatarUrl" size="43">
              <img :src="avatarUrl" alt="Avatar" style="object-fit: cover; width: 100%; height: 100%;" />
            </v-avatar>
            <v-icon v-else>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list @click="closeMenu">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ userName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="goToProfile">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>View Profile</v-list-item-content>
          </v-list-item>
          <v-list-item @click="signOut">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Sign Out</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn icon v-if="userName !== 'Anonymous'" @click="GoToInbox">
        <v-icon>mdi-email</v-icon>
      </v-btn>


    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
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
      avatarUrl: null,
      menuVisible: false,
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    closeMenu() {
      this.menuVisible = false;
    },

    async signOut() {
      try {
        const auth = getAuth();
        await signOut(auth);
        this.userName = "Anonymous";
        this.avatarUrl = null;
      } catch (error) {
        console.error("Sign out error: ", error);
      }
    },
    GoToInbox() {
      this.$router.push("/UserInboxPage");
    },
    goToProfile() {
      this.$router.push("/UserProfilePage");
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
            this.avatarUrl = userData.avatarUrl || null;
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

<style scoped>
::v-deep(.v-toolbar-title) {
  font-weight: 900;
  font-size: 40px;
  line-height: 1.6;
  /* Adjust line-height to prevent cutting off */
  letter-spacing: 3px;
  padding-bottom: 7px;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: border-box;
  /* Standard property */
  -webkit-background-clip: border-box;
  /* For WebKit-based browsers */
  -moz-background-clip: border-box;
  /* For Firefox (if needed) */

  text-shadow:
    3px 3px 0px #a7a5a594,
    /* Dark purple shadow */
    6px 6px 0px #302a4d,
    /* Deeper shadow */
    9px 9px 5px rgba(49, 48, 48, 0.4);
  /* Soft outer glow */
}
</style>
