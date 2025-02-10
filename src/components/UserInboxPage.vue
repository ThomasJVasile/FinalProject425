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
      <v-card-title class="text-h5"></v-card-title>
      <v-text-field v-model="searchQuery" label="Search Messages" @input="searchMessagesFromDB"></v-text-field>
      <v-list>
        <v-list-item v-for="message in filteredMessages" :key="message.id">
          <v-card class="pa-3 mb-2">
            <v-card-subtitle>
              <strong>From:</strong> {{ message.senderUsername }} <br />
              <strong>To:</strong> {{ message.ReceiverUsername }}
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
      this.messages.forEach(msg => {
    if (msg !== message) msg.replying = false;
  });
      message.replying = !message.replying;
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
        const messagesSnapshot = await getDocs(
          query(collection(db, "messages"), where("ReceiverID", "==", currentUser.uid))
        );        
      
        this.messages = await Promise.all(messagesSnapshot.docs.map(async (docSnapshot) => {
          const messageData = docSnapshot.data();
          const senderDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", messageData.SenderID)));
          const senderUsername = senderDoc.empty ? "Unknown User" : senderDoc.docs[0].data().username;
          const receiverDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", messageData.ReceiverID)));
          const ReceiverUsername = receiverDoc.empty ? "Unknown User" : receiverDoc.docs[0].data().username;
          return {
            id: docSnapshot.id,
            ...messageData,
            senderUsername, // Attach the sender's username
            ReceiverUsername,
            timestamp: messageData.timestamp?.toDate(),
        };
      }));

      
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