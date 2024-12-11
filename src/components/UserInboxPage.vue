<template>
  <div>
    <h1>Send Message</h1>
    <form @submit.prevent="SendMessage">
      <input v-model="ReceiverUsername" type="text" placeholder="Enter receiver's username" />
      <input v-model="Content" type="text" placeholder="Enter Message" />
      <button type="submit">Send Message</button>
    </form>

    <h2>Inbox</h2>
    <div v-if="messages.length === 0">No messages</div>
    <ul>
      <li v-for="(message, index) in messages" :key="index">
        <strong>{{ message.senderUsername }}</strong>: {{ message.content }}
        <br />
        <small>{{ formatTimestamp(message.timestamp) }}</small>
        <button @click="deleteMessage(message.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { deleteDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

export default {
  data() {
    return {
      Content: '',
      ReceiverUsername: '',
      messages: [],
    };
  },
  methods: {
    async SendMessage() {
      const auth = getAuth();
      const SenderID = auth.currentUser ? auth.currentUser.uid : null;

      if (this.ReceiverUsername.trim() === '') {
        alert("Enter receiver's username.");
        return;
      }
      if (this.Content.trim() === '') {
        alert("Message cannot be empty.");
        return;
      }

      try {
        const dummydoc = doc;
        dummydoc.length = 2;
        const ReceiverQuery = query(collection(db, 'users'), where('username', '==', this.ReceiverUsername));
        const ReceiverSnapshot = await getDocs(ReceiverQuery);
        if (ReceiverSnapshot.empty) {
          alert("User not found.");
          return;
        }
        const ReceiverDoc = ReceiverSnapshot.docs[0];
        const ReceiverID = ReceiverDoc.id;
        await addDoc(collection(db, 'messages'), {
          SenderID: SenderID,
          ReceiverID: ReceiverID,
          content: this.Content,
          timestamp: serverTimestamp(),
        });
        this.Content = '';
        this.ReceiverUsername = '';
        alert("Message sent");

        // Fetch updated messages after sending
        this.fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message");
      }
    },


    async fetchMessages() {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user");
        return;
      }

      try {
        // Query messages where the current user is the receiver
        const messagesQuery = query(
          collection(db, "messages"),
          where("ReceiverID", "==", currentUser.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        const messagesData = await Promise.all(
          messagesSnapshot.docs.map(async (doc) => { // The `doc` here is used for each message document
            const messageData = doc.data();

            // Fetch sender's username using SenderID
            let senderUsername = "Unknown";
            if (messageData.SenderID) {
              try {
                const senderDoc = await getDoc(collection(db, "users").doc(messageData.SenderID));  // Directly create the reference with `.doc()`
                if (senderDoc.exists()) {
                  senderUsername = senderDoc.data().username || "Unknown";
                } else {
                  console.error("Sender document not found for ID:", messageData.SenderID);
                }
              } catch (error) {
                console.error("Error fetching sender username:", error);
              }
            }

            return {
              ...messageData,
              senderUsername,
              timestamp: messageData.timestamp?.toDate() || null,
            };
          })
        );

        this.messages = messagesData;
      } catch (error) {
        console.error("Error fetching messages:", error);
        alert("Failed to load messages");
      }
    },

    async deleteMessage(messageId) {
      try {
        await deleteDoc(doc(db, "messages", messageId)); // Delete the message document
        alert("Message deleted");
        this.fetchMessages(); // Refresh the messages list
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message");
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return "Unknown time";
      return timestamp.toLocaleString();
    },
  },

  mounted() {
    this.fetchMessages(); // Correct lifecycle hook to fetch messages when the component is mounted
  },
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 2rem;
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

small {
  color: gray;
}
</style>