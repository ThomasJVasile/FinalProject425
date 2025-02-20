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
        <v-list-item v-for="message in messages" :key="message.id">
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
              <v-btn color="primary" @click="message.expanded = !message.expanded">
                {{ message.expanded ? "Hide History" : "View History" }}
              </v-btn>
              <v-btn color="success" @click="initiateReply(message)">
                {{ message.replying ? "Cancel" : "Reply" }}
              </v-btn>
              <v-btn color="error" @click="deleteMessage(message.id)">Delete</v-btn>
            </v-card-actions>

            <!-- reply input field -->
            <v-expand-transition>
              <div v-if="message.replying" class="pa-3">
                <v-text-field v-model="replyContent" label="Type your reply..." variant="outlined" dense></v-text-field>
                <v-btn color="success" @click="sendReply(message)">Send</v-btn>
              </div>
            </v-expand-transition>

            <!-- expandable message history -->
            <v-expand-transition>
              <div v-if="message.expanded">
                <v-list dense>
                  <v-list-item v-for="oldMessage in messageHistory.get(message.SenderID)?.filter(m => m.id !== message.id)" :key="oldMessage.id">
                    <v-card class="pa-2">
                      <v-card-text>
                        <strong>{{ oldMessage.senderUsername }}:</strong> {{ oldMessage.content }}
                        <br />
                        <small>{{ oldMessage.timestamp ? new Date(oldMessage.timestamp).toLocaleString() : 'Unknown Date' }}</small>
                      </v-card-text>
                    </v-card>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
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
    initiateReply(message) {
      this.messages.forEach(msg => msg.replying = false);
      message.replying = true;
    },
    async sendReply(parentMessage) {
      if (!this.replyContent || typeof this.replyContent !== 'string' || !this.replyContent.trim()) {
        alert("Reply cannot be empty.");
        return;
      }

      if (!this.replyContent || !this.replyContent.trim()) {
        alert("Reply cannot be empty.");
        return;
      }
      try {
        const SenderID = getAuth().currentUser?.uid;
        await addDoc(collection(db, 'messages'), {
          SenderID,
          ReceiverID: parentMessage.SenderID,
          content: this.replyContent.trim(),
          timestamp: serverTimestamp(),
        });
        this.replyContent = ''; // Clear after sending
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

        const latestMessages = new Map();
        const messageHistory = new Map();

        for (const docSnapshot of messagesSnapshot.docs) {
  const messageData = docSnapshot.data();
  const senderId = messageData.SenderID;

  // Convert timestamp to Date object if it's not already
  messageData.timestamp = messageData.timestamp ? messageData.timestamp.toDate() : null;

  if (!messageHistory.has(senderId)) {    
    messageHistory.set(senderId, []);
  }

  messageHistory.get(senderId).unshift({ id: docSnapshot.id, ...messageData }); // Reverse order

  if (!latestMessages.has(senderId) || latestMessages.get(senderId).timestamp < messageData.timestamp) {  
    latestMessages.set(senderId, { id: docSnapshot.id, ...messageData });
  }
}
        this.messages = await Promise.all(
          Array.from(latestMessages.values()).map(async (message) => {
            const senderDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", message.SenderID)));
            const senderUsername = senderDoc.empty ? "Unknown User" : senderDoc.docs[0].data().username;
            const receiverDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", message.ReceiverID)));
            const ReceiverUsername = receiverDoc.empty ? "Unknown User" : receiverDoc.docs[0].data().username;

            return {
              ...message,
              senderUsername,
              ReceiverUsername,
              timestamp: message.timestamp ? message.timestamp.toLocaleString() : 'Unknown Date',
              expanded: false, // track dropdown state
            };
          })
        );

        this.messageHistory = messageHistory; // store full history
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
