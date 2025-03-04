<!-- This is the freidn request implementation. It is currently not functioning when the assignment is submitted bbut will be by spring 2025 -->



<template>
  <div class="friend-request-page">
    <h1>Friend Requests</h1>
    
    <!-- Pending Requests Section -->
    <div class="requests-section">
      <h2>Pending Requests</h2>
      <div v-if="loading" class="loading">Loading requests...</div>
      <div v-else-if="receivedRequests.length === 0" class="no-requests">
        No pending friend requests.
      </div>

      <ul v-else class="request-list">
        <li v-for="request in receivedRequests" :key="request.id" class="request-item">
          <div class="request-info">
            <strong>{{ request.senderUsername }}</strong>
            <span class="request-date">{{ formatDate(request.timestamp) }}</span>
          </div>
          <div class="request-actions">
            <button @click="acceptRequest(request)" class="accept-btn">Accept</button>
            <button @click="rejectRequest(request.id)" class="reject-btn">Reject</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Send Request Section -->
    <div class="send-request-section">
      <h2>Send Friend Request</h2>
      <form @submit.prevent="sendFriendRequest" class="send-request-form">
        <div class="input-group">
          <input
            v-model="receiverUsername"
            type="text"
            placeholder="Enter username"
            required
            :disabled="sending"
          />
          <button type="submit" :disabled="sending || !receiverUsername">
            {{ sending ? 'Sending...' : 'Send Request' }}
          </button>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  name: 'FriendRequest',
  data() {
    return {
      receiverUsername: '',
      receivedRequests: [],
      loading: true,
      sending: false,
      error: null,
      unsubscribe: null,
    };
  },

  methods: {
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },

    async sendFriendRequest() {
      this.sending = true;
      this.error = null;
      const auth = getAuth();
      const sender = auth.currentUser;

      if (!sender) {
        this.error = 'You need to be logged in to send a request.';
        this.sending = false;
        return;
      }

      try {
        // Check if receiver exists
        const receiverQuery = query(
          collection(db, 'users'),
          where('username', '==', this.receiverUsername)
        );
        const receiverSnapshot = await getDocs(receiverQuery);

        if (receiverSnapshot.empty) {
          this.error = 'User not found.';
          return;
        }

        const receiverDoc = receiverSnapshot.docs[0];
        const receiverID = receiverDoc.id;

        // Don't allow sending request to self
        if (receiverID === sender.uid) {
          this.error = 'You cannot send a friend request to yourself.';
          return;
        }

        // Check if request already exists
        const existingRequestQuery = query(
          collection(db, 'friendRequests'),
          where('senderID', '==', sender.uid),
          where('receiverID', '==', receiverID)
        );
        const existingRequestSnapshot = await getDocs(existingRequestQuery);

        if (!existingRequestSnapshot.empty) {
          this.error = 'A friend request to this user already exists.';
          return;
        }

        // Check if they're already friends
        const friendsRef = doc(db, 'friendships', `${sender.uid}_${receiverID}`);
        const friendshipDoc = await getDoc(friendsRef);
        
        if (friendshipDoc.exists()) {
          this.error = 'You are already friends with this user.';
          return;
        }

        // Create the friend request
        await addDoc(collection(db, 'friendRequests'), {
          senderID: sender.uid,
          senderUsername: sender.email || sender.displayName || 'Unknown',
          receiverID: receiverID,
          receiverUsername: this.receiverUsername,
          status: 'pending',
          timestamp: serverTimestamp(),
        });

        this.receiverUsername = '';
        this.error = null;
        alert('Friend request sent successfully!');
      } catch (error) {
        console.error('Error sending friend request:', error);
        this.error = 'Failed to send request. Please try again.';
      } finally {
        this.sending = false;
      }
    },

    async acceptRequest(request) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return;

      try {
        // Create friendship document for both users
        const friendship1 = doc(db, 'friendships', `${currentUser.uid}_${request.senderID}`);
        const friendship2 = doc(db, 'friendships', `${request.senderID}_${currentUser.uid}`);

        await setDoc(friendship1, {
          users: [currentUser.uid, request.senderID],
          timestamp: serverTimestamp(),
        });

        await setDoc(friendship2, {
          users: [request.senderID, currentUser.uid],
          timestamp: serverTimestamp(),
        });

        // Delete the request
        await deleteDoc(doc(db, 'friendRequests', request.id));
        
        alert('Friend request accepted!');
      } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Failed to accept request. Please try again.');
      }
    },

    async rejectRequest(requestID) {
      try {
        await deleteDoc(doc(db, 'friendRequests', requestID));
        alert('Friend request rejected.');
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        alert('Failed to reject request. Please try again.');
      }
    },

    setupRealtimeListener() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Clean up previous listener if exists
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('receiverID', '==', currentUser.uid)
      );

      this.unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        this.receivedRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.loading = false;
      }, (error) => {
        console.error('Error in realtime listener:', error);
        this.loading = false;
      });
    },
  },

  mounted() {
    this.setupRealtimeListener();
  },

  beforeUnmount() {
    // Clean up listener when component is destroyed
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
};
</script>

<style scoped>
.friend-request-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.requests-section, .send-request-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.request-list {
  list-style: none;
  padding: 0;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin: 0.5rem 0;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.request-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.request-date {
  font-size: 0.8rem;
  color: #666;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input[type='text'] {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accept-btn {
  background-color: #4CAF50;
  color: white;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #f44336;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.loading, .no-requests {
  text-align: center;
  color: #666;
  padding: 1rem;
}
</style>
