<template>
  <v-container>
    <v-row>
      <!-- Sidebar -->
      <v-col cols="3">
        <v-card class="pa-4">
          <v-list>
            <v-list-item @click="activeForm = 'message'">Inbox</v-list-item>
            <v-list-item @click="activeForm = 'notifications'">Event Requests</v-list-item>
            <v-list-item @click="activeForm = 'event-notifications'">Event Notifications</v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Main Content -->
      <v-col cols="9">
        <v-row v-if="activeForm === 'message'">
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title class="text-h5">Send Message</v-card-title>
              <v-text-field v-model="ReceiverUsername" label="Receiver Username" />
              <v-textarea v-model="content" label="Message Content" rows="4" />
              <v-btn color="success" @click="sendMessage">Send</v-btn>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <!-- Messages Section -->
          <v-col v-if="activeForm === 'message'" cols="12">
            <v-card class="pa-4">
              <v-card-title class="text-h5">Inbox</v-card-title>
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
                    <v-expand-transition>
                      <div v-if="message.replying" class="pa-3">
                        <v-text-field v-model="replyContent" label="Type your reply..." variant="outlined"
                          dense></v-text-field>
                        <v-btn color="success" @click="sendReply(message)">Send</v-btn>
                      </div>
                    </v-expand-transition>
                    <v-expand-transition>
                      <div v-if="message.expanded">
                        <v-list dense>
                          <v-list-item
                            v-for="oldMessage in messageHistory.get(message.SenderID)?.filter(m => m.id !== message.id)"
                            :key="oldMessage.id">
                            <v-card class="pa-2">
                              <v-card-text>
                                <strong>{{ oldMessage.senderUsername }}:</strong> {{ oldMessage.content }}
                                <br />
                                <small>{{ oldMessage.timestamp ? new Date(oldMessage.timestamp).toLocaleString() :
                                  'Unknown Date' }}</small>
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
          </v-col>

          <v-col v-if="activeForm === 'event-notifications'" cols="12">
            <v-card class="pa-4">
              <v-card-title class="text-h5">Event Notifications</v-card-title>
              <v-list>
                <v-list-item v-for="eventNotification in eventNotifications" :key="eventNotification.id">
                  <v-card class="pa-3 mb-2">
                    <v-card-text>
                      <strong>Event:</strong> {{ eventNotification.eventName }}<br />
                      <strong>Message:</strong> {{ eventNotification.message }}<br />
                      <small>{{ eventNotification.timestamp }}</small>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="primary" @click="viewEventDetails(eventNotification.eventId)">View Details</v-btn>
                      <v-btn color="error" @click="dismissNotification(eventNotification.id)">Dismiss</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>


          <!-- Notifications Section -->
          <v-col v-if="activeForm === 'notifications'" cols="12">
            <v-card class="pa-4">
              <v-card-title class="text-h5">Event Requests</v-card-title>
              <v-list>
                <v-list-item v-for="notification in notifications" :key="notification.id">
                  <v-card class="pa-3 mb-2">
                    <v-card-text>
                      {{ notification.content }}
                      <br />
                      <small>{{ notification.timestamp }}</small>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="success" @click="acceptRequest(notification)">Accept</v-btn>
                      <v-btn color="error" @click="rejectRequest(notification)">Reject</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {

  data() {
    return {
      activeForm: 'message', // Default view
      content: '',
      ReceiverUsername: '',
      messages: [],
      searchQuery: '',
      replyContent: '',
      notifications: [], // Assuming this is populated somewhere
      eventNotifications: [],
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
    async fetchEventNotifications() {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const notificationsSnapshot = await getDocs(
          query(collection(db, "EventNotification"), where("recipientUID", "==", currentUser.uid))
        );

        this.eventNotifications = notificationsSnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            eventName: data.EventID,
            message: data.notifications,
            timestamp: data.timestamp ? data.timestamp.toDate().toLocaleString() : 'Unknown Date',
          };
        });
        console.log("Fetched event notifications:", this.eventNotifications);
      } catch (error) {
        console.error("Error fetching event notifications:", error);
      }
    },

    async sendMessage() {
      if (!this.content || !this.ReceiverUsername) {
        alert("Please provide both a receiver username and a message.");
        return;
      }

      try {
        // Get the ReceiverID from username
        const userSnapshot = await getDocs(
          query(collection(db, "users"), where("username", "==", this.ReceiverUsername))
        );

        if (userSnapshot.empty) {
          alert("User not found.");
          return;
        }

        const receiverDoc = userSnapshot.docs[0];
        const ReceiverID = receiverDoc.id; // Get ReceiverID based on username

        const SenderID = getAuth().currentUser?.uid; // Get the SenderID (current logged-in user)

        if (!SenderID) {
          alert("User not authenticated.");
          return;
        }

        // Create a new message document
        await addDoc(collection(db, 'messages'), {
          SenderID,
          ReceiverID,
          content: this.content.trim(),
          timestamp: serverTimestamp(),
        });

        // Clear the form
        this.content = '';
        this.ReceiverUsername = '';
        this.fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },


    async fetchNotifications() {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const requestsSnapshot = await getDocs(
          query(collection(db, "RequestJoin"), where("EventOwnerUID", "==", currentUser.uid), where("status", "==", "pending"))

        );


        this.notifications = requestsSnapshot.docs.map(docSnapshot => {
          const requestData = docSnapshot.data();
          return {
            id: docSnapshot.id,
            content: `${requestData.RequestingUsername} has requested to attend ${requestData.EventName}.`,
            timestamp: requestData.timestamp ? requestData.timestamp.toDate().toLocaleString() : 'Unknown Date',
            EventID: requestData.EventID,
            UserID: requestData.RequestingUserUID,
          };
        });
      } catch (error) {
        console.error("Error fetching event notifications:", error);
      }
    },
    async acceptRequest(notification) {
      try {
        // Update the request status
        await updateDoc(doc(db, "RequestJoin", notification.id), { status: "accepted" });

        // Fetch event document to update UserIDs
        const eventDocRef = doc(db, "events", notification.EventID); // Corrected EventID reference
        const eventDocSnap = await getDoc(eventDocRef); // Get the actual document snapshot



        if (eventDocSnap.exists()) {
          await updateDoc(eventDocRef, {
            UserIDs: arrayUnion(notification.UserID),
          });
          await addDoc(collection(db, "EventNotification"), {
            recipientUID: notification.UserID, // Requesting user's UID
            notifications: "You have been accepted",
            eventID: notification.EventID, // Optional, in case you need to reference the event
            timestamp: serverTimestamp()
          });
          this.fetchNotifications();
        } else {
          console.error("Event document not found.");
        }
      } catch (error) {
        console.error("Error accepting request:", error);
      }
    },
    async rejectRequest(notification) {
      try {
        await deleteDoc(doc(db, "RequestJoin", notification.id));
        this.fetchNotifications();
      } catch (error) {
        console.error("Error rejecting request:", error);
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

          messageData.timestamp = messageData.timestamp ? messageData.timestamp.toDate() : null;

          if (!messageHistory.has(senderId)) {
            messageHistory.set(senderId, []);
          }

          messageHistory.get(senderId).unshift({ id: docSnapshot.id, ...messageData });

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
              expanded: false,
            };
          })
        );

        this.messageHistory = messageHistory;
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
    this.fetchNotifications();
    this.fetchEventNotifications()
  },
};
</script>
