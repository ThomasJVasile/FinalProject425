<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5">Send Message</v-card-title>
      <v-form @submit.prevent="SendMessage">
        <v-text-field v-model="ReceiverUsername" label="Receiver's Username" required></v-text-field>
        <v-text-field v-model="Content" label="Message" required></v-text-field>
        <v-btn color="primary" type="submit" block>Send Message</v-btn>
      </v-form>
    </v-card>

    <v-card class="mt-4 pa-4">
      <v-card-title class="text-h5">Inbox</v-card-title>
      <v-text-field v-model="searchQuery" label="Search messages" @input="searchMessagesFromDB"></v-text-field>
      <v-list>
        <v-list-item v-for="message in filteredMessages" :key="message.id">
          <v-card class="pa-3 mb-2">
            <v-card-subtitle>
              <strong>From:</strong> {{ message.senderUsername }} <br />
              <strong>To:</strong> {{ message.ReceiverID }}
            </v-card-subtitle>
            <v-card-text>
              {{ message.content }}
              <br />
              <small>{{ message.timestamp }}</small>
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" @click="deleteMessage(message.id)">Delete</v-btn>
              <v-btn color="secondary" @click="showReplyForm(message)">Reply</v-btn>
            </v-card-actions>
            <v-expand-transition>
              <div v-if="message.replying">
                <v-text-field v-model="replyContent" label="Enter your reply"></v-text-field>
                <v-btn color="success" @click="sendReply(message.id)" block>Send Reply</v-btn>
              </div>
            </v-expand-transition>
            <v-list dense>
              <v-list-item v-for="reply in message.replies" :key="reply.id">
                <v-card class="pa-2">
                  <v-card-text>
                    <strong>Reply:</strong> {{ reply.content }}
                    <br />
                    <small>{{ reply.timestamp }}</small>
                  </v-card-text>
                </v-card>
              </v-list-item>
            </v-list>
          </v-card>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
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
    filteredMessages() {
      if (!this.searchQuery.trim()) return this.messages;
      return this.messages.filter(message =>
        message.senderUsername.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async showReplyForm(message) {
      this.messages.forEach(msg => msg.replying = false);
      message.replying = true;
    },
    async sendReply(parentMessageId) {
      if (!this.replyContent.trim()) return alert("Reply cannot be empty.");
      try {
        const SenderID = getAuth().currentUser?.uid;
        await addDoc(collection(db, 'replies'), {
          parentMessageId, SenderID, content: this.replyContent, timestamp: serverTimestamp(),
        });
        this.replyContent = '';
        this.fetchMessages();
      } catch (error) {
        console.error("Error sending reply:", error);
      }
    },
    async SendMessage() {
      if (!this.ReceiverUsername.trim() || !this.Content.trim()) return;
      try {
        const auth = getAuth();
        const SenderID = auth.currentUser?.uid;
        const ReceiverSnapshot = await getDocs(query(collection(db, 'users'), where('username', '==', this.ReceiverUsername)));
        if (ReceiverSnapshot.empty) return alert("User not found.");
        await addDoc(collection(db, 'messages'), {
          SenderID, ReceiverID: ReceiverSnapshot.docs[0].id, content: this.Content, timestamp: serverTimestamp(),
        });
        this.Content = ''; this.ReceiverUsername = '';
        this.fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    async fetchMessages() {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;
        const messagesSnapshot = await getDocs(query(collection(db, "messages"), where("ReceiverID", "==", currentUser.uid)));
        this.messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    async deleteMessage(messageId) {
      try {
        await deleteDoc(doc(db, "messages", messageId));
        this.fetchMessages();
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    },
  },
  mounted() {
    this.fetchMessages();
  },
};
</script>

<!-- <style scoped>
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
</style> -->