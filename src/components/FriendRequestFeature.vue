<!-- This is the freidn request implementation. It is currently not functioning when the assignment is submitted bbut will be by spring 2025 -->



<template>
  <div class="friend-request-page">
    <h1>Friend Requests</h1>
    <div v-if="receivedRequests.length === 0">No pending friend requests.</div>

    <ul>
      <li v-for="request in receivedRequests" :key="request.id">
        <strong>{{ request.senderUsername }}</strong>
        <button @click="acceptRequest(request.id)">Accept</button>
        <button @click="rejectRequest(request.id)">Reject</button>
      </li>
    </ul>

    <h2>Send Friend Request</h2>
    <form @submit.prevent="sendFriendRequest">
      <input v-model="receiverUsername" type="text" placeholder="Enter username" required />
      <button type="submit">Send Request</button>
    </form>
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
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  data() {
    return {
      receiverUsername: '',
      receivedRequests: [],
    };
  },

  methods: {
    async sendFriendRequest() {
      const auth = getAuth();
      const sender = auth.currentUser;
      if (!sender) {
        alert('You need to be logged in to send a request.');
        return;
      }
      try {
        const receiverQuery = query(
          collection(db, 'users'),
          where('username', '==', this.receiverUsername)
        );
        const receiverSnapshot = await getDocs(receiverQuery);
        if (receiverSnapshot.empty) {
          alert('User not found.');
          return;
        }

        const receiverDoc = receiverSnapshot.docs[0];
        const receiverID = receiverDoc.id;

        await addDoc(collection(db, 'friendRequests'), {
          senderID: sender.uid,
          senderUsername: sender.email || 'Unknown',
          receiverID: receiverID,
        });
        alert('Friend request sent!');
        this.receiverUsername = '';
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Failed to send request.');
      }
    },

    async fetchFriendRequests() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const requestsQuery = query(
          collection(db, 'friendRequests'),
          where('receiverID', '==', currentUser.uid)
        );
        const requestsSnapshot = await getDocs(requestsQuery);

        this.receivedRequests = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    },

    async acceptRequest(requestID) {
      try {
        const requestDoc = doc(db, 'friendRequests', requestID);
        await deleteDoc(requestDoc);
        alert('Friend request accepted!');
        this.fetchFriendRequests();
      } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Failed to accept request.');
      }
    },

    async rejectRequest(requestID) {
      try {
        const requestDoc = doc(db, 'friendRequests', requestID);
        await deleteDoc(requestDoc);
        alert('Friend request rejected.');
        this.fetchFriendRequests();
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        alert('Failed to reject request.');
      }
    },
  },

  mounted() {
    this.fetchFriendRequests();
  },
};
</script>

<style scoped>
.friend-request-page {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1, h2 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f9f9f9;
  margin: 0.5rem 0;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

input[type='text'] {
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 1rem);
}

button {
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}
</style>
