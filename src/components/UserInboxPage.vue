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
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { db } from '@/firebase';
  import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
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
  
        try {
          const messagesQuery = query(
            collection(db, "messages"),
            where("ReceiverID", "==", currentUser.uid),
            orderBy("timestamp", "desc")
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          const messagesData = await Promise.all(
            messagesSnapshot.docs.map(async (doc) => {
              const messageData = doc.data();
              const senderDoc = await getDocs(
                query(collection(db, "users"), where("uid", "==", messageData.SenderID))
              );
              let senderUsername = "Unknown";
              if (!senderDoc.empty) {
                senderUsername = senderDoc.docs[0].data().username;
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
  