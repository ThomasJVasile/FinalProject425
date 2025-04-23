<template>
  <v-app-bar app color="primary" dark>
    <!-- App title -->
    <v-toolbar-title class="app-logo">Get Together</v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Nav buttons -->
    <v-btn text to="/homepage">Home</v-btn>
    <v-btn v-if="isAuthenticated" text to="/create-event">Create Event</v-btn>
    <v-btn v-else text to="/RegisterPage">Register</v-btn>
    <v-btn v-if="!isAuthenticated" text to="/log-in">Log In</v-btn>

    <!-- Inbox -->
    <v-badge
      v-if="isAuthenticated && NotificationCount > 0"
      :content="NotificationCount"
      color="red"
      overlap
      bordered
      offset-x="8"
      offset-y="8"
    >
      <v-btn icon @click="GoToInbox">
        <v-icon>mdi-email</v-icon>
      </v-btn>
    </v-badge>

    <v-btn
      v-else-if="isAuthenticated"
      icon
      @click="GoToInbox"
    >
      <v-icon>mdi-email</v-icon>
    </v-btn>

    <!-- Avatar + menu -->
    <v-menu v-if="isAuthenticated" v-model="menuVisible" offset-y>
      <template #activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar v-if="avatarUrl" size="43">
            <img :src="avatarUrl" alt="Avatar" style="object-fit: cover; width: 100%; height: 100%;" />
          </v-avatar>
          <v-icon v-else>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>{{ userName }}</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="goToProfile">
          <v-icon>mdi-account</v-icon>
          <v-list-item-title>View Profile</v-list-item-title>
        </v-list-item>
        <v-list-item @click="signOut">
          <v-icon>mdi-logout</v-icon>
          <v-list-item-title>Sign Out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { doc, getDoc, getDocs, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  name: "NavBar",
  data() {
    return {
      userName: "Anonymous",
      avatarUrl: null,
      menuVisible: false,
      NotificationCount: 0,
      isAuthenticated: false,
    };
  },
  methods: {
    async signOut() {
      try {
        await signOut(getAuth());
        this.userName = "Anonymous";
        this.avatarUrl = null;
        this.isAuthenticated = false;
        this.$router.push('/log-in');
      } catch (error) {
        console.error("Sign out error:", error);
      }
    },
    GoToInbox() {
      this.$router.push("/UserInboxPage");
    },
    goToProfile() {
      this.$router.push("/UserProfilePage");
    },
    async GetNotificationCount() {
      const CurrentUser = getAuth().currentUser;
      if (!CurrentUser) return;

      const ChatHistoryReference = collection(db, "ChatHistoryUserPair");
      const q1 = query(ChatHistoryReference, where("UserOne", "==", CurrentUser.uid));
      const q2 = query(ChatHistoryReference, where("UserTwo", "==", CurrentUser.uid));

      onSnapshot(q1, () => this.UpdateNotificationsCount());
      onSnapshot(q2, () => this.UpdateNotificationsCount());
    },
    async UpdateNotificationsCount() {
      const CurrentUser = getAuth().currentUser;
      if (!CurrentUser) return;

      const ChatHistoryReference = collection(db, "ChatHistoryUserPair");
      const q1 = query(ChatHistoryReference, where("UserOne", "==", CurrentUser.uid));
      const q2 = query(ChatHistoryReference, where("UserTwo", "==", CurrentUser.uid));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const allChats = [...snap1.docs, ...snap2.docs].map(doc => doc.data());

      let count = 0;
      let unseenIds = [];

      for (const chat of allChats) {
        count += (chat.MessageHistory.length - 1 - chat.SeenOffset);
        unseenIds.push(...chat.MessageHistory.slice(chat.SeenOffset + 1));
      }

      const unseen = await Promise.all(unseenIds.map(id => getDoc(doc(db, "messages", id))));
      for (const m of unseen.map(doc => doc.data())) {
        if (m.SenderID === CurrentUser.uid) count--;
      }

      this.NotificationCount = count;
    },
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.isAuthenticated = true;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          this.userName = `${data.firstName} ${data.lastName}`;
          this.avatarUrl = data.avatarUrl || null;
          this.GetNotificationCount();
        }
      } else {
        this.isAuthenticated = false;
        this.userName = "Anonymous";
        this.avatarUrl = null;
      }
    });
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.app-logo {
  font-weight: bold;
  font-size: 20px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .app-logo {
    font-size: 18px !important;
  }

  .navbar {
    padding: 0 5px;
  }

  .v-btn {
    min-width: 36px;
    padding: 0 8px;
  }
}
</style>
