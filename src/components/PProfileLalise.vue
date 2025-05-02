<!-- // LG BEGIN - New public profile component.-->
<template>
  <div id="public-profile-page">
    <!-- Add Cover Photo Section -->
    <div class="cover-photo-container">
      <img 
        v-if="profileData.coverPhotoUrl" 
        :src="profileData.coverPhotoUrl" 
        alt="Cover Photo" 
        class="cover-photo"
        @error="profileData.coverPhotoUrl = null"
      />
      <div v-else class="cover-photo-placeholder">
        <div class="gradient-background"></div>
      </div>
      
      <!-- Only show edit button if it's the user's own profile -->
      <div v-if="isOwnProfile" class="cover-photo-edit">
        <label for="cover-photo-upload" class="edit-button">
          <i class="fas fa-camera"></i>
          Edit Cover Photo
        </label>
        <input 
          type="file" 
          id="cover-photo-upload" 
          accept="image/*"
          @change="handleCoverPhotoUpload"
          style="display: none;"
        />
      </div>
    </div>

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

      <div class="social-links">
        <a 
          v-if="profileData.instagramLink" 
          :href="profileData.instagramLink" 
          target="_blank" 
          class="social-link"
        >
          <i class="fab fa-instagram"></i>
        </a>
        <a 
          v-if="profileData.tiktokLink" 
          :href="profileData.tiktokLink" 
          target="_blank" 
          class="social-link"
        >
          <i class="fab fa-tiktok"></i>
        </a>
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
          v-else-if="!isFriend && friendRequestSent"
        >
          <i class="fas fa-clock"></i> Friend Request Sent
        </button>
        <button 
          class="friend-status" 
          v-else-if="isFriend"
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
            <p class="interests-text" v-if="profileData.interests">{{ profileData.interests }}</p>
            <div class="no-content" v-else>No interests added yet</div>
          </div>
        </div>
      </div>

      <!-- Friends Tab Content -->
      <div v-if="activeTab === 'friends'" class="profile-main">
        <div class="content-card">
          <h2>Friends</h2>
          <div v-if="userFriends.length > 0" class="friends-list">
            <div v-for="friend in userFriends" 
                 :key="friend.id" 
                 class="friend-item">
              <div class="friend-avatar-small">
                <img 
                  v-if="friend.avatarUrl" 
                  :src="friend.avatarUrl" 
                  :alt="friend.username"
                  class="friend-image-small"
                  @error="friend.avatarUrl = null"
                />
                <div v-else class="default-avatar-small">
                  <i class="fas fa-user"></i>
                </div>
              </div>
              <div class="friend-username">
                @{{ friend.username || 'Anonymous' }}
              </div>
            </div>
          </div>
          <div v-else class="no-content">No friends yet</div>
        </div>
      </div>

      <!-- Events Tab Content -->
      <div v-if="activeTab === 'events'" class="profile-main">
        <div class="content-card">
          <h2>Public Events</h2>
          <div v-if="userEvents && userEvents.length > 0" class="events-grid">
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
                <p class="event-description">{{ event.eventDescription }}</p>
                <div class="event-meta">
                  <span class="event-date" v-if="event.eventDate && event.eventDate !== ''">
                    <i class="fas fa-calendar"></i>
                    {{ event.eventDate }}
                  </span>
                  <span class="event-location" v-if="event.eventLocation">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ event.eventLocation }}
                  </span>
                  <div class="event-categories" v-if="event.categories && event.categories.length > 0">
                    <span v-for="category in event.categories" 
                          :key="category" 
                          class="category-tag">
                      {{ category }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-content">No public events available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
// LG BEGIN - Script section
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  serverTimestamp,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';

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
      interests: '',
      location: '',
      avatarUrl: null,
      coverPhotoUrl: null,
      instagramLink: '',
      tiktokLink: ''
    });
    const userEvents = ref([]);
    const userFriends = ref([]);
    const isFriend = ref(false);
    const friendRequestSent = ref(false);
    const isOwnProfile = ref(false);

    let unsubscribeFriendship = null;

    // eslint-disable-next-line no-unused-vars
    const loadUserFriends = async () => {
      try {
        const userId = route.params.userId;
        const friendsQuery = query(
          collection(db, 'friendships'),
          where('users', 'array-contains', userId)
        );
        const friendsSnapshot = await getDocs(friendsQuery);

        // Use Set for unique friend IDs
        const friendIds = new Set();
        friendsSnapshot.forEach(doc => {
          const users = doc.data().users;
          const friendId = users.find(uid => uid !== userId);
          if (friendId) friendIds.add(friendId);
        });

        // Convert Set to Array for mapping
        const friendPromises = Array.from(friendIds).map(async friendId => {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            return {
              id: friendId,
              firstName: friendData.firstName || '',
              lastName: friendData.lastName || '',
              username: friendData.username || '',
              avatarUrl: friendData.avatarUrl || null,
              location: friendData.location || ''
            };
          }
          return null;
        });
        userFriends.value = (await Promise.all(friendPromises)).filter(Boolean);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    };

    // eslint-disable-next-line no-unused-vars
    const loadUserEvents = async () => {
      try {
        const userId = route.params.userId;
        console.log('Loading events for userId:', userId);

        // Update query to match your database structure
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', userId),    // Using createdBy as per your DB
          where('isRestricted', '==', false)   // Show only non-restricted events
        );

        const eventsSnapshot = await getDocs(eventsQuery);
        console.log('Found events:', eventsSnapshot.size);

        userEvents.value = eventsSnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            ...eventData,
            // Format date if it exists and is not empty
            eventDate: eventData.eventDate && eventData.eventDate !== "" 
              ? new Date(eventData.eventDate) 
              : null
          };
        });

        console.log('Processed events:', userEvents.value);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    // Load user profile data
    const loadUserProfile = async () => {
      try {
        const userId = route.params.userId;
        const currentUser = getAuth().currentUser;

        // Set isOwnProfile
        isOwnProfile.value = currentUser?.uid === userId;

        // Load user profile data
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          profileData.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            bio: userData.bio || '',
            interests: userData.interests || '',
            location: userData.location || '',
            avatarUrl: userData.avatarUrl || null,
            coverPhotoUrl: userData.coverPhotoUrl || null,
            instagramLink: userData.instagramLink || '',
            tiktokLink: userData.tiktokLink || ''
          };
        }

        // Check friendship status if not own profile
        if (currentUser && !isOwnProfile.value) {
          // First, check direct friendship in friendships collection
          const friendshipQuery = query(
            collection(db, 'friendships'),
            where('users', 'array-contains', currentUser.uid)
          );
          
          const friendshipSnapshot = await getDocs(friendshipQuery);
          
          // Check if they are friends by looking for a document that contains both users
          isFriend.value = friendshipSnapshot.docs.some(doc => {
            const users = doc.data().users;
            return users.includes(userId) && users.includes(currentUser.uid);
          });

          // Only check for pending requests if they're not already friends
          if (!isFriend.value) {
            // Check for pending friend requests
            const requestQuery = query(
              collection(db, 'friendRequests'),
              where('fromUserId', '==', currentUser.uid),
              where('toUserId', '==', userId),
              where('status', '==', 'pending')
            );
            
            const requestSnapshot = await getDocs(requestQuery);
            friendRequestSent.value = !requestSnapshot.empty;
          } else {
            // Reset friend request sent status if they are friends
            friendRequestSent.value = false;
          }
        } else {
          // Reset states if it's own profile or no user is logged in
          isFriend.value = false;
          friendRequestSent.value = false;
        }

      } catch (error) {
        console.error('Error loading user profile:', error);
        // Reset states on error
        isFriend.value = false;
        friendRequestSent.value = false;
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

    //fixing friendhsip 
    watch(isFriend, (newValue) => {
    if (newValue) {
      // If they become friends, ensure request sent is false
      friendRequestSent.value = false;
      // Reload the profile data to get updated events access
      loadUserProfile();
    }
  });

    watch(activeTab, (newTab) => {
      if (newTab === 'events') {
        console.log('Events tab selected, loading events...');
        loadUserEvents();
      }
    });

    // Add this temporary function to check event structure
    const debugEvents = async () => {
      try {
        const userId = route.params.userId;
        const eventsRef = collection(db, 'events');
        const allEvents = await getDocs(eventsRef);
        
        console.log('All events:', allEvents.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
        
        console.log('Looking for events with createdBy:', userId);
      } catch (error) {
        console.error('Error debugging events:', error);
      }
    };

    // Call this in onMounted temporarily
    onMounted(() => {
      debugEvents(); // Add this temporarily
      loadUserProfile();
      loadUserFriends();
      if (activeTab.value === 'events') {
        loadUserEvents();
      }
      // Setup friendship listener
      unsubscribeFriendship = setupFriendshipListener();
      window.addEventListener('userNameUpdated', handleNameUpdate);
    });

    onUnmounted(() => {
      window.removeEventListener('userNameUpdated', handleNameUpdate);
      // Cleanup friendship listener
      if (unsubscribeFriendship) {
        unsubscribeFriendship();
      }
    });

    // Add auth state change listener
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserProfile();
        unsubscribeFriendship = setupFriendshipListener();
      } else {
        if (unsubscribeFriendship) {
          unsubscribeFriendship();
        }
        isFriend.value = false;
        friendRequestSent.value = false;
      }
    });

    const handleCoverPhotoUpload = async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          if (typeof window.$toast !== 'undefined') {
            window.$toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
          }
          return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          if (typeof window.$toast !== 'undefined') {
            window.$toast.error('Image size should be less than 5MB');
          }
          return;
        }

        const userId = getAuth().currentUser.uid;
        const coverPhotoRef = storageRef(
          storage,
          `cover-photos/${userId}_${Date.now()}_${file.name}`
        );

        // Upload file
        await uploadBytes(coverPhotoRef, file);
        const downloadURL = await getDownloadURL(coverPhotoRef);

        // Update Firestore
        await updateDoc(doc(db, 'users', userId), {
          coverPhotoUrl: downloadURL
        });

        // Update local state
        profileData.value.coverPhotoUrl = downloadURL;

        if (typeof window.$toast !== 'undefined') {
          window.$toast.success('Cover photo updated successfully');
        }
      } catch (error) {
        console.error('Error uploading cover photo:', error);
        if (typeof window.$toast !== 'undefined') {
          window.$toast.error('Failed to update cover photo');
        }
      }
    };

    const setupFriendshipListener = () => {
      const currentUser = getAuth().currentUser;
      const userId = route.params.userId;
      
      if (!currentUser || isOwnProfile.value) return;

      // Listen to friendships collection
      const friendshipQuery = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', currentUser.uid)
      );

      const unsubscribe = onSnapshot(friendshipQuery, (snapshot) => {
        isFriend.value = snapshot.docs.some(doc => {
          const users = doc.data().users;
          return users.includes(userId) && users.includes(currentUser.uid);
        });

        // If they are friends, ensure friend request sent is false
        if (isFriend.value) {
          friendRequestSent.value = false;
        }
      });

      // Return unsubscribe function
      return unsubscribe;
    };

    return {
      activeTab,
      profileData,
      userEvents,
      userFriends,
      isFriend,
      friendRequestSent,
      isOwnProfile,
      sendFriendRequest,
      loadUserFriends,   // Add this
      loadUserEvents,
      handleCoverPhotoUpload,
      setupFriendshipListener
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

.cover-photo-container {
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: -80px; /* Overlap with profile section */
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-photo-placeholder {
  width: 100%;
  height: 100%;
}

.gradient-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a73e8, #4285f4, #34a853);
}

.cover-photo-edit {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background: white;
}

.edit-button i {
  font-size: 16px;
}

.profile-header {
  position: relative;
  z-index: 1;
  margin-top: -20px; /* Adjust based on your design */
  margin-left: 20px;
  margin-right: 20px;
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
  position: relative;
  margin-top: -40px; /* Pull up into cover photo area */
  border: 4px solid white;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  padding: 0 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  position: relative;
}

.tab-button {
  padding: 15px 25px;
  border: none;
  background: none;
  color: #65676b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #1877f2;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 3px 3px 0 0;
}

.tab-button:hover {
  color: #1877f2;
  background-color: rgba(24, 119, 242, 0.05);
}

.tab-button:hover::after {
  transform: scaleX(0.8);
}

.tab-button.active {
  color: #1877f2;
  background-color: rgba(24, 119, 242, 0.1);
}

.tab-button.active::after {
  transform: scaleX(1);
}

.tab-button i {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.tab-button:hover i {
  transform: scale(1.1);
}

.tab-button.active i {
  transform: scale(1.1);
}

/* Add this to ensure proper spacing with the content below */
.profile-content {
  margin-top: 30px;
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

.event-description {
  margin: 8px 0;
  color: #65676b;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #65676b;
}

.event-date, .event-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-image-container {
  width: 100%;
  height: 160px;
  background: #f0f2f5;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
  font-size: 24px;
}

.friend-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e4e6eb;
  color: #1a1a1a;
  border-radius: 6px;
  font-weight: 600;
}

.friend-status i {
  color: #1877f2;
}

/* Add these new styles to your existing style section */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.friend-item:hover {
  background-color: #f0f2f5;
}

.friend-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-image-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e4e6eb;
  color: #65676b;
}

.default-avatar-small i {
  font-size: 20px;
}

.friend-username {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.event-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.category-tag {
  background-color: #e4e6eb;
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.social-links {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, background-color 0.2s;
}

.social-link:hover {
  transform: scale(1.1);
  background-color: #fff;
}

.social-link i {
  font-size: 1.5rem;
}

.social-link i.fa-instagram {
  background: -webkit-linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.social-link i.fa-tiktok {
  color: #000;
}
/* LG END - Styles section */
</style>
<!-- // LG END - New public profile component --> 