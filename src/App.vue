


    <!-- Navbar -->
    <!-- <v-app-bar app color="primary" dark class="navbar">
      <v-container class="d-flex align-center justify-space-between">
        <v-toolbar-title class="app-logo">Get Together</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text to="/homepage">Home</v-btn>
        <v-btn v-if="userName === 'Anonymous'" text to="/log-in">Log In</v-btn>
        <v-btn v-if="userName === 'Anonymous'" text to="/RegisterPage">Register</v-btn>
        <v-btn v-if="userName !== 'Anonymous'" text to="/create-event">Create Event</v-btn>
        <v-menu v-model="menuVisible" :position="'bottom-start'" absolute :style="menuStyle">
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

        <v-badge v-if="userName !== 'Anonymous' && NotificationCount > 0" :content="NotificationCount" color="red"
          overlap bordered offset-x="8" offset-y="8">
          <v-btn icon @click="GoToInbox">
            <v-icon>mdi-email</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else-if="userName !== 'Anonymous'" icon @click="GoToInbox">
          <v-icon>mdi-email</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar> -->


<!--     
<template>
  <v-app>
        <NavBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getDocs, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import NavBar from "@/components/NavBar.vue";


export default {
  name: "App",
  data() {
    return {
      userName: "Anonymous",
      avatarUrl: null,
      menuVisible: false,
      NotificationCount: 0,
      menuStyle: {
        top: '3.3vw',
        right: '10px',
        left: '91vw',
        zIndex: 9999,
      },
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
        this.$router.push('/log-in');
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

    async GetNotificationCount() {
      await this.GetNotificationCountCall();
    },

    async GetNotificationCountCall() {
      const CurrentUser = getAuth().currentUser;
      if (!CurrentUser) {
        console.log("No user authenticated - GetNotificationCountCall()");
        return 0;
      }
      const ChatHistoryReference = collection(db, "ChatHistoryUserPair");
      const UsersChatQueryOne = query(ChatHistoryReference, where("UserOne", "==", CurrentUser.uid));
      const UsersChatQueryTwo = query(ChatHistoryReference, where("UserTwo", "==", CurrentUser.uid));
      try {
        onSnapshot(UsersChatQueryOne, () => {
          this.UpdateNotificationsCount();
        });
        onSnapshot(UsersChatQueryTwo, () => {
          this.UpdateNotificationsCount();
        });
      } catch (error) {
        console.error("Some error in GetNotificationCountCall(): ");
        return 99;
      }
    },

    async UpdateNotificationsCount() {
      const CurrentUser = getAuth().currentUser;
      if (!CurrentUser) {
        console.log("No user authenticated - GetNotificationCountCall()");
        return 0;
      }
      const ChatHistoryReference = collection(db, "ChatHistoryUserPair");
      const UsersChatQueryOne = query(ChatHistoryReference, where("UserOne", "==", CurrentUser.uid));
      const UsersChatQueryTwo = query(ChatHistoryReference, where("UserTwo", "==", CurrentUser.uid));
      try {
        const [MessageHistorySnapOne, MessageHistorySnapTwo] = await Promise.all([
          getDocs(UsersChatQueryOne),
          getDocs(UsersChatQueryTwo),
        ]);
        const ChatHistoryDocuments = [
          ...MessageHistorySnapOne.docs,
          ...MessageHistorySnapTwo.docs,
        ];
        if (ChatHistoryDocuments.length === 0) {
          console.log("No chat histories with this user - GetNotificationCountCall()");
          return 99;
        }

        const ChatHistoriesArray = ChatHistoryDocuments.map(doc => doc.data());
        console.log("ChatHistoriesArray - UpdateNotificationsCount()", ChatHistoriesArray);

        let UnseenMessageIDs = [];

        let LocalNotificationCount = 0;
        for (const Chat of ChatHistoriesArray) {
          LocalNotificationCount += (Chat.MessageHistory.length - 1 - Chat.SeenOffset);
          const UnseenIDs = Chat.MessageHistory.slice(Chat.SeenOffset + 1);
          UnseenMessageIDs.push(...UnseenIDs);
        }

        const UnseenMessages = await Promise.all(
          UnseenMessageIDs.map(id => getDoc(doc(db, "messages", id)))
        );
        const UnseenMessagesData = UnseenMessages.map(docSnap => docSnap.data());


        for (const message of UnseenMessagesData) {
          if (message.SenderID === CurrentUser.uid) {
            LocalNotificationCount--;
          }
        }

        console.log("Unseen Messages - UpdateNotificationsCount()", UnseenMessagesData);
        console.log("LocalNotificationCount: ", LocalNotificationCount);
        this.NotificationCount = LocalNotificationCount;
      } catch (error) {
        console.log("some error - UpdateNotificationsCount(): ", error);
      }
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
            this.GetNotificationCount();
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
    font-size: 20px !important;
  }

  .navbar {
    padding: 0 5px;
  }

  /* Hide some buttons on extra small screens */
  .v-btn {
    min-width: 36px;
    padding: 0 8px;
  }
}
</style> -->









<template>
  <v-app>
   
    <NavBar />

   
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  name: "App",
  components: {
    NavBar,
  },
};
</script>

<style scoped>
/* Optional global layout adjustments */

@media (max-width: 768px) {
  .v-main {
    padding: 8px;
  }
}
</style>
