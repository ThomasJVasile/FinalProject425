<!-- 
  This is the public profile page that shows:
  1. User's basic info (name, location, profile pic)
  2. Friend request/status buttons
  3. About section and interests
  4. Public events they've created
  Users can view this page and send friend requests from here
-->

<template>
  <div id="public-profile-page">
    <!-- Header Section - Shows the user's profile picture and basic info -->
    <div class="profile-header">
      <!-- Profile Picture Section - Shows user's avatar or default icon -->
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

      <!-- Basic Info - Name and Location -->
      <div class="basic-info">
        <h1>{{ profileData.firstName }} {{ profileData.lastName }}</h1>
        <div class="location" v-if="profileData.location">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ profileData.location }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons - Friend request options (only shown on other people's profiles) -->
    <div class="profile-actions" v-if="!isOwnProfile">
      <!-- Add Friend Button - Shows when not friends and no pending request -->
      <button 
        class="action-button" 
        @click="sendFriendRequest"
        v-if="!isFriend && !friendRequestSent"
      >
        <i class="fas fa-user-plus"></i> Add Friend
      </button>
      <!-- Pending Request Button - Shows when request is sent but not accepted -->
      <button 
        class="action-button disabled" 
        v-else-if="friendRequestSent"
      >
        <i class="fas fa-clock"></i> Request Sent
      </button>
      <!-- Friends Status - Shows when you're already friends -->
      <button 
        class="action-button friends" 
        v-else
      >
        <i class="fas fa-user-check"></i> Friends
      </button>
    </div>

    <!-- Main Content Area - Contains about, interests, and events sections -->
    <div class="profile-content">
      <div class="profile-main">
        <!-- About Section - User's bio -->
        <div class="content-card">
          <h2>About</h2>
          <div class="bio-text" v-if="profileData.bio">{{ profileData.bio }}</div>
          <div class="no-content" v-else>No bio added</div>
        </div>

        <!-- Interests Section - User's hobbies and interests -->
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

        <!-- Events Section - Public events created by the user -->
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
// Import Vue and routing stuff
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Import Firebase stuff we need
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
    // Set up reactive data for the profile
    const route = useRoute();
    const profileData = ref({}); // Holds user's profile info
    const userEvents = ref([]); // List of user's public events
    const isFriend = ref(false); // Whether you're friends with this user
    const friendRequestSent = ref(false); // Whether you've sent them a request
    const isOwnProfile = ref(false); // Whether this is your own profile

    // Loads all the user's profile data
    const loadUserProfile = async () => {
      try {
        const userId = route.params.userId;
        const currentUser = getAuth().currentUser;
        
        // Check if we're looking at our own profile
        isOwnProfile.value = currentUser?.uid === userId;

        // Get the user's basic profile info
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          profileData.value = userDoc.data();
        }

        // If we're logged in, check friendship status
        if (currentUser) {
          // See if we're already friends
          const friendsQuery = query(
            collection(db, 'friends'),
            where('users', 'array-contains', currentUser.uid)
          );
          const friendsSnapshot = await getDocs(friendsQuery);
          isFriend.value = friendsSnapshot.docs.some(doc => 
            doc.data().users.includes(userId)
          );

          // Check if we've already sent a request
          const requestQuery = query(
            collection(db, 'friendRequests'),
            where('fromUserId', '==', currentUser.uid),
            where('toUserId', '==', userId),
            where('status', '==', 'pending')
          );
          const requestSnapshot = await getDocs(requestQuery);
          friendRequestSent.value = !requestSnapshot.empty;
        }

        // Get their public events
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

    // Handles sending a friend request
    const sendFriendRequest = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const userId = route.params.userId;
        
        // Get our name to show in the request
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = currentUserDoc.data();
        const senderName = currentUserData.firstName && currentUserData.lastName 
          ? `${currentUserData.firstName} ${currentUserData.lastName}`
          : currentUser.displayName || 'Anonymous';

        // Create the friend request in the database
        await addDoc(collection(db, 'friendRequests'), {
          fromUserId: currentUser.uid,
          toUserId: userId,
          status: 'pending',
          timestamp: serverTimestamp(),
          fromUserName: senderName,
          toUserName: profileData.value.firstName + ' ' + profileData.value.lastName
        });

        // Update the UI to show request is sent
        friendRequestSent.value = true;
        
        // Show a success message if toast is available
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

    //thoams route to user public profile page form event detail when they click on woners name
   

    // Load profile data when component mounts
    onMounted(loadUserProfile);

    // Make everything available to the template
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
/* Main page layout */
#public-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f2f5;
}

/* Header section styling */
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

/* Action buttons container */
.profile-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

/* Profile picture circle */
.profile-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #ddd;
  position: relative;
  overflow: hidden;
}

/* Profile image */
.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Events grid layout */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

/* Event card styling */
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

/* Event image */
.event-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

/* Placeholder for missing event images */
.event-img-placeholder {
  width: 100%;
  height: 120px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
}

/* Event information section */
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