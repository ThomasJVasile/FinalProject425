<!-- 
  This file is commented out and replaced by PProfileLalise.vue
  Original content preserved below for reference:
-->
<!--
<template>
  <div id="public-profile-page">
    <div class="profile-header">
      <div class="profile-picture"> 
        <div class="profile-circle">
          <img 
            v-if="profileData.avatarUrl" 
            :src="profileData.avatarUrl" 
            alt="Profile Picture" 
            class="profile-image" 
          />
          <i class="fa fa-user user-icon" v-else></i>    
        </div>
      </div>

      <div class="basic-info">
        <h1>{{ profileData.firstName }} {{ profileData.lastName }}</h1>
        <div class="location" v-if="profileData.location">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ profileData.location }}</span>
        </div>
      </div>
    </div>

    <div class="profile-actions" v-if="!isOwnProfile">
      <button 
        class="action-button" 
        @click="sendFriendRequest"
        v-if="!isFriend && !friendRequestSent"
      >
        <i class="fas fa-user-plus"></i> Add Friend
      </button>
      <button 
        class="action-button disabled" 
        v-else-if="friendRequestSent"
      >
        <i class="fas fa-clock"></i> Request Sent
      </button>
      <button 
        class="action-button friends" 
        v-else
      >
        <i class="fas fa-user-check"></i> Friends
      </button>
    </div>

    <div class="profile-content">
      <div class="profile-main">
        <div class="content-card">
          <h2>About</h2>
          <div class="bio-text" v-if="profileData.bio">{{ profileData.bio }}</div>
          <div class="no-content" v-else>No bio added</div>
        </div>

        <div class="content-card">
          <h2>Interests & Hobbies</h2>
          <div class="interests-container">
            <ul class="interests-list" v-if="profileData.interests && profileData.interests.length > 0">
              <li v-for="(interest, index) in profileData.interests" 
                  :key="index" 
                  class="interest-item">
                <i class="fas fa-circle"></i>
                {{ interest }}
              </li>
            </ul>
            <div class="no-content" v-else>No interests added</div>
          </div>
        </div>

        <div class="content-card">
          <h2>Events</h2>
          <div class="events-grid" v-if="userEvents.length > 0">
            <div v-for="event in userEvents" :key="event.id" class="event-card">
              <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.eventName" class="event-img">
              <div v-else class="event-img-placeholder">No Image</div>
              <div class="event-info">
                <h3>{{ event.eventName }}</h3>
                <p>{{ event.eventDescription }}</p>
              </div>
            </div>
          </div>
          <div class="no-content" v-else>No events created</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default {
  created() {
    const userId = this.$route.params.userId;
    console.log("Viewing public profile for user:", userId);
  },

  setup() {
    const route = useRoute();
    const profileData = ref({});
    const userEvents = ref([]);
    const isFriend = ref(false);
    const friendRequestSent = ref(false);
    const isOwnProfile = ref(false);

    const loadUserProfile = async () => {
      try {
        const userId = route.params.userId;
        const currentUser = getAuth().currentUser;
        
        isOwnProfile.value = currentUser?.uid === userId;

        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          profileData.value = userDoc.data();
        }

        if (currentUser) {
          const friendsQuery = query(
            collection(db, 'friends'),
            where('users', 'array-contains', currentUser.uid)
          );
          const friendsSnapshot = await getDocs(friendsQuery);
          isFriend.value = friendsSnapshot.docs.some(doc => 
            doc.data().users.includes(userId)
          );

          const requestQuery = query(
            collection(db, 'friendRequests'),
            where('fromUserId', '==', currentUser.uid),
            where('toUserId', '==', userId),
            where('status', '==', 'pending')
          );
          const requestSnapshot = await getDocs(requestQuery);
          friendRequestSent.value = !requestSnapshot.empty;
        }

        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', userId),
          where('isPrivate', '==', false)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        userEvents.value = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    const sendFriendRequest = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const userId = route.params.userId;
        
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = currentUserDoc.data();
        const senderName = currentUserData.firstName && currentUserData.lastName 
          ? `${currentUserData.firstName} ${currentUserData.lastName}`
          : currentUser.displayName || 'Anonymous';

        await addDoc(collection(db, 'friendRequests'), {
          fromUserId: currentUser.uid,
          toUserId: userId,
          status: 'pending',
          timestamp: serverTimestamp(),
          fromUserName: senderName,
          toUserName: profileData.value.firstName + ' ' + profileData.value.lastName
        });

        friendRequestSent.value = true;
        
        if (typeof window.$toast !== 'undefined') {
          window.$toast.success('Friend request sent!');
        }
      } catch (error) {
        console.error('Error sending friend request:', error);
        if (typeof window.$toast !== 'undefined') {
          window.$toast.error('Failed to send friend request. Please try again.');
        }
      }
    };

    onMounted(loadUserProfile);

    return {
      profileData,
      userEvents,
      isFriend,
      friendRequestSent,
      isOwnProfile,
      sendFriendRequest
    };
  }
};
</script>

<style scoped>
#public-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f2f5;
}

.profile-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.profile-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #ddd;
  position: relative;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.event-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.event-img-placeholder {
  width: 100%;
  height: 120px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
}

.event-info {
  padding: 12px;
}

.event-info h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #1a1a1a;
}

.event-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #65676b;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
--> 