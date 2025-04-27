<!-- // LG BEGIN - New public profile component, test new branch..-->
<template>
  <div id="public-profile-page">
    <!-- Header Section with Profile Picture and Basic Info -->
    <div class="profile-header">
      <div class="profile-picture"> 
        <div class="profile-circle">
          <img 
            v-if="profileData.avatarUrl" 
            :src="profileData.avatarUrl" 
            alt="Profile Picture" 
            class="profile-image" 
            @error="profileData.avatarUrl = null"
          />
          <svg 
            v-else 
            class="default-avatar" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
              fill="#65676b"
            />
          </svg>
        </div>
      </div>

      <div class="basic-info">
        <h1>{{ profileData.firstName }} {{ profileData.lastName }}</h1>
        <div class="username" v-if="profileData.username">@{{ profileData.username }}</div>
        <div class="location" v-if="profileData.location">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ profileData.location }}</span>
        </div>
      </div>
    </div>

          <!--/div> -- This is the closing tag of basic-info -->
      
      <!-- Add the friend request buttons here -->
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

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'about' }"
        @click="activeTab = 'about'"
      >
        <i class="fa fa-user"></i> About
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'friends' }"
        @click="activeTab = 'friends'"
      >
        <i class="fa fa-user-friends"></i> Friends
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'events' }"
        @click="activeTab = 'events'"
      >
        <i class="fa fa-calendar"></i> Events
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="profile-content">
      <!-- About Tab Content -->
      <div v-if="activeTab === 'about'" class="profile-main">
        <!-- About Section -->
        <div class="content-card">
          <h2>About</h2>
          <div class="bio-text" v-if="profileData.bio">{{ profileData.bio }}</div>
          <div class="no-content" v-else>No bio added yet</div>
        </div>

        <!-- Interests Section -->
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
            <div class="no-content" v-else>No interests added yet</div>
          </div>
        </div>
      </div>

      <!-- Friends Tab Content -->
      <div v-if="activeTab === 'friends'" class="profile-main">
        <div class="content-card">
          <h2>Friends</h2>
          <div v-if="userFriends.length > 0" class="friends-grid">
            <div v-for="friend in userFriends" :key="friend.id" class="friend-card">
              <div class="friend-avatar">
                <img 
                  v-if="friend.avatarUrl" 
                  :src="friend.avatarUrl" 
                  :alt="`${friend.firstName} ${friend.lastName}`"
                  class="friend-image"
                  @error="friend.avatarUrl = null"
                />
                <svg 
                  v-else 
                  class="default-avatar" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                    fill="#65676b"
                  />
                </svg>
              </div>
              <div class="friend-info">
                <h3>{{ friend.firstName }} {{ friend.lastName }}</h3>
              </div>
            </div>
          </div>
          <div v-else class="no-content">No friends yet</div>
        </div>
      </div>

      <!-- Events Tab Content -->
      <div v-if="activeTab === 'events'" class="profile-main">
        <div class="content-card">
          <h2>Created Events</h2>
          <div v-if="userEvents.length > 0" class="events-grid">
            <div v-for="event in userEvents" :key="event.id" class="event-card">
              <div class="event-image-container">
                <img 
                  v-if="event.imageUrl" 
                  :src="event.imageUrl" 
                  :alt="event.eventName"
                  class="event-image"
                />
                <div v-else class="event-image-placeholder">
                  <i class="fas fa-calendar-alt"></i>
                </div>
              </div>
              <div class="event-info">
                <h3>{{ event.eventName }}</h3>
                <p>{{ event.eventDescription }}</p>
                <div class="event-meta">
                  <span class="event-date">
                    <i class="fas fa-calendar"></i>
                    {{ new Date(event.eventDate).toLocaleDateString() }}
                  </span>
                  <span class="event-location" v-if="event.location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ event.location }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-content">No events created yet</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// LG BEGIN - Script section
import { ref, onMounted, onUnmounted } from 'vue';
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
  name: 'PProfileLalise',
  setup() {
    const route = useRoute();
    const activeTab = ref('about');
    const profileData = ref({
      firstName: '',
      lastName: '',
      username: '',
      bio: '',
      interests: [],
      location: '',
      avatarUrl: null
    });
    const userEvents = ref([]);
    const userFriends = ref([]);
    const isFriend = ref(false);
    const friendRequestSent = ref(false);
    const isOwnProfile = ref(false);

    // Load user profile data
    const loadUserProfile = async () => {
      try {
        const userId = route.params.userId;
        const currentUser = getAuth().currentUser;

        //const userDoc = await getDoc(doc(db, 'users', userId));

        isOwnProfile.value = currentUser?.uid === userId;
         const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          profileData.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            bio: userData.bio || '',
            interests: userData.interests || [],
            location: userData.location || '',
            avatarUrl: userData.avatarUrl || null
          };
        }

        if (currentUser) {
            // Check if they are already friends
            const friendsQuery = query(
              collection(db, 'friends'),
              where('users', 'array-contains', currentUser.uid)
            );
            const friendsSnapshot = await getDocs(friendsQuery);
            isFriend.value = friendsSnapshot.docs.some(doc => 
              doc.data().users.includes(userId)
            );

            // Check if a friend request is pending
            const requestQuery = query(
              collection(db, 'friendRequests'),
              where('fromUserId', '==', currentUser.uid),
              where('toUserId', '==', userId),
              where('status', '==', 'pending')
            );
          const requestSnapshot = await getDocs(requestQuery);
          friendRequestSent.value = !requestSnapshot.empty;
        }
        // Load user's events
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', userId)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        userEvents.value = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Load user's friends
        const friendsQuery = query(
          collection(db, 'friends'),
          where('users', 'array-contains', userId)
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsPromises = friendsSnapshot.docs.map(async (doc) => {
          const friendId = doc.data().users.find(id => id !== userId);
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            return {
              id: friendId,
              firstName: friendData.firstName,
              lastName: friendData.lastName,
              avatarUrl: friendData.avatarUrl
            };
          }
          return null;
        });
        userFriends.value = (await Promise.all(friendsPromises)).filter(Boolean);

      } catch (error) {
        console.error('Error loading user profile:', error);
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






    // Listen for name updates
    const handleNameUpdate = (event) => {
      const { firstName, lastName } = event.detail;
      if (route.params.userId === getAuth().currentUser?.uid) {
        profileData.value.firstName = firstName;
        profileData.value.lastName = lastName;
      }
    };

    onMounted(() => {
      loadUserProfile();
      window.addEventListener('userNameUpdated', handleNameUpdate);
    });

    onUnmounted(() => {
      window.removeEventListener('userNameUpdated', handleNameUpdate);
    });

    return {
      activeTab,
      profileData,
      userEvents,
      userFriends,
      isFriend,
      friendRequestSent,
      isOwnProfile,
      sendFriendRequest
    };
  }
};
// LG END - Script section
</script>

<style scoped>
/* LG BEGIN - Styles section */
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

.profile-picture {
  flex-shrink: 0;
}

.profile-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #f0f2f5;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  padding: 20%;
  background: #e4e6eb;
}

.basic-info {
  flex-grow: 1;
}

.basic-info h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 24px;
}

.username {
  color: #65676b;
  margin: 4px 0;
  font-size: 16px;
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #65676b;
  margin-top: 8px;
}

.location i {
  color: #1877f2;
}

.profile-tabs {
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: none;
  color: #65676b;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #f0f2f5;
}

.tab-button.active {
  color: #1877f2;
  background: #e6f0ff;
}

.tab-button i {
  margin-right: 8px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-main {
  width: 100%;
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.content-card h2 {
  color: #1a1a1a;
  font-size: 20px;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e6eb;
}

.bio-text {
  color: #1a1a1a;
  line-height: 1.5;
}

.interests-container {
  width: 100%;
}

.interests-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #1a1a1a;
  font-size: 0.95rem;
  border-bottom: 1px solid #f0f2f5;
}

.interest-item:last-child {
  border-bottom: none;
}

.interest-item i {
  font-size: 6px;
  color: #65676b;
}

.no-content {
  color: #65676b;
  font-style: italic;
}

/* Friends Grid */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.friend-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.friend-card:hover {
  transform: translateY(-2px);
}

.friend-avatar {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: #f0f2f5;
}

.friend-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  padding: 12px;
  text-align: center;
}

.friend-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #1a1a1a;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.event-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-image-container {
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  background: #f0f2f5;
}

.event-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
  font-size: 2rem;
}

.event-info {
  padding: 16px;
}

.event-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.event-info p {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #65676b;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  color: #65676b;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-meta i {
  color: #1877f2;
}


.profile-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-button i {
  font-size: 16px;
}

.action-button:not(.disabled):hover {
  opacity: 0.9;
}

.action-button.disabled {
  background: #e4e6eb;
  color: #65676b;
  cursor: not-allowed;
}

.action-button:not(.disabled):not(.friends) {
  background: #1877f2;
  color: white;
}

.action-button.friends {
  background: #e4e6eb;
  color: #1a1a1a;
}
/* LG END - Styles section */
</style>
<!-- // LG END - New public profile component --> 