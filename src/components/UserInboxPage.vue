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
    <input v-model="searchQuery" type="text" placeholder="Search messages" />
    <button @click="searchMessages">Search</button>
    <ul>
      <li v-for="message in filteredMessages" :key="message.id">
        <p><strong>From:</strong> {{ message.SenderID }}</p>
        <p><strong>To:</strong> {{ message.ReceiverID }}</p>
        <p>{{ message.content }}</p>
        <p>{{ message.timestamp }}</p>
        <button @click="deleteMessage(message.id)">Delete</button>
        <button @click="showReplyForm(message)">Reply</button>
        <div v-if="message.replying">
          <input v-model="replyContent" type="text" placeholder="Enter your reply" />
          <button @click="sendReply(message.id)">Send Reply</button>
        </div>
        <ul>
          <li v-for="reply in message.replies" :key="reply.id">
            <strong>Reply:</strong> {{ reply.content }}
            <br />
            <small>{{ formatTimestamp(reply.timestamp) }}</small>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, updateDoc, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { deleteDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

export default {
  data() {
    return { 
      Content: '',
      ReceiverUsername: '',
      messages: [],
      searchQuery: '',
      replyContent: '',
    };
  },
  computed: {
    filteredMessages() {  // FUNCTION FOR FILTERING MESSAGES 
      if (!this.searchQuery.trim()) return this.messages;
      return this.messages.filter(message =>
        message.senderUsername.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async toggleReadStatus(messageId, newStatus) {
      try {
        await updateDoc(doc(db, "messages", messageId), { read: newStatus });
        this.fetchMessages(); // Refresh the messages list
      } catch (error) {
        console.error("Error toggling read status:", error);
        alert("Failed to update read status");
      }
    },
    showReplyForm(message) {
      this.messages.forEach((msg) => (msg.replying = false));
      message.replying = true;
    },
    async sendReply(parentMessageId) {
      if (this.replyContent.trim() === '') {
        alert("Reply cannot be empty.");
        return;
      }

      try {
        const auth = getAuth();
        const SenderID = auth.currentUser ? auth.currentUser.uid : null;

        await addDoc(collection(db, 'replies'), {
          parentMessageId,
          SenderID,
          content: this.replyContent,
          timestamp: serverTimestamp(),
        });

        this.replyContent = ''; // Clear the reply input
        this.fetchMessages(); // Refresh the messages list
        alert("Reply sent");
      } catch (error) {
        console.error("Error sending reply:", error);
        alert("Failed to send reply");
      }
    },

    async SendMessage() { // FUNCTION FOR SENDING MESSAGES
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

        this.fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message");
      }
    },

    async searchMessagesFromDB() {
      if (!this.searchQuery.trim()) {
        this.fetchMessages();
        return;
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user");
        return;
      }

      try {
        const messagesQuery = query(
          collection(db, "messages"),
          where("ReceiverID", "==", currentUser.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        const messagesData = await Promise.all(
          messagesSnapshot.docs.map(async (doc) => {
            const messageData = doc.data();


            let senderUsername = "Unknown";
            if (messageData.SenderID) {
              const senderDoc = await getDoc(doc(db, "users", messageData.SenderID));
              if (senderDoc.exists()) {
                senderUsername = senderDoc.data().username || "Unknown";
              }
            }

            return {
              ...messageData,
              senderUsername,
              timestamp: messageData.timestamp?.toDate() || null,
            };
          })
        );

        // Filter results by query
        this.messages = messagesData.filter(message =>
          message.senderUsername.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          message.content.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } catch (error) {
        console.error("Error searching messages:", error);
        alert("Failed to search messages");
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
        const messagesQuery = query(
          collection(db, "messages"),
          where("ReceiverID", "==", currentUser.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(messages);

        this.messages = messages.map(message => ({
          ...message,
          timestamp: message.timestamp ? message.timestamp.toDate() : null
        }));

      } catch (error) {
        console.error("Error fetching messages:", error);
        alert("Failed to load messages");
      }
    },

    async deleteMessage(messageId) { // REMOVE A MESSAGE FROM THE DATABASE
      try {
        await deleteDoc(doc(db, "messages", messageId)); // Delete the message document
        alert("Message deleted");
        this.fetchMessages(); // Refresh the messages list
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message");
      }
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
  color: #333;
  text-align: center;
}

h2 {
  margin-top: 2rem;
  font-size: 1.5rem;
  color: #555;
  text-align: center;
}

form {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

input[type="text"] {
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 1.5rem);
  display: block;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 0;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 1rem auto;
  max-width: 600px;
}

li {
  background: #f9f9f9;
  margin: 0.5rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

li strong {
  color: #333;
}

li small {
  color: gray;
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

li button {
  margin-top: 0.5rem;
  background-color: #ff4d4d;
}

li button:hover {
  background-color: #cc0000;
}

input[type="text"]:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

div {
  text-align: center;
}

div.v-if {
  margin: 1rem auto;
  color: #666;
}

.reply-input {
  margin-top: 1rem;
  padding: 1rem;
  background: #eef;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reply-input input {
  width: calc(100% - 2rem);
  margin: 0;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.reply-input button {
  margin-top: 0.5rem;
  background-color: #28a745;
}

.reply-input button:hover {
  background-color: #218838;
}

.reply-list li {
  background: #eef9f1;
  border: 1px solid #c3e6cb;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
}
</style>