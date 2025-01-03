<!-- This is not functioing yyet but maybe in future we will implement to group chat fetaure
. Implemened by Lalise 
https://www.cometchat.com/tutorials/build-a-vue-chat-app
 -->

 <template>
  <div class="chat-wrapper">
   <div class="chat-messages" ref="chatBox">
      <div v-for="msg in chatHistory" :key="msg.id" class="chat-entry">
		    <div class="avatar-wrapper">
		  <img :src="msg.sender?.avatar || placeholderAvatar" alt="User Avatar" />
        </div>
        <div class="message-body">
					       <p class="username">{{ msg.sender?.username || 'Guest' }}</p>
          <p class="text">{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input v-model="messageText" type="text" placeholder="type yiu message" />
      <button @click="submitMessage">Send</button>
    </div>
  </div>
</template>


<!--

<script>
  import Login from '
  import Messages from '??
  import Channels from
  const Chat = require('
  let chatChannel;
  let Client;

   export default {
      components: {
         Messages,
         Login,
         Channels
      },
      data: function () {
          return {
            authenticated: false,
            messages: [],
            userData: {},
            token: null,
            channels: [],
            active_channel: null
          }
      },
      methods: {}
  }
</script>


// ./src/views/Chat.vue
<script>
...
export default {
...
 data() {
   ...
 },
 mounted() {
   this.loadingMessages = true;
   var listenerID = "UNIQUE_LISTENER_ID";
   const messagesRequest = new CometChat.MessagesRequestBuilder()
     .setLimit(100)
     .build();
   messagesRequest.fetchPrevious().then(
     messages => {
       console.log("Message list fetched:", messages);
       console.log("this.groupMessages", this.groupMessages);
       this.groupMessages = [...this.groupMessages, ...messages];
       this.loadingMessages = false;
       this.$nextTick(() => {
         this.scrollToBottom();
       });
     },
     error => {
       console.log("Message fetching failed with error:", error);
     }
   );
   CometChat.addMessageListener(
     listenerID,
     new CometChat.MessageListener({
       onTextMessageReceived: textMessage => {
         console.log("Text message received successfully", textMessage);
         // Handle text message
         console.log(this.groupMessages);
         this.groupMessages = [...this.groupMessages, textMessage];
         // console.log("avatar", textMessage.sender.avatar)
         this.loadingMessages = false;
         this.$nextTick(() => {
           this.scrollToBottom();
         });
       }
     })
   );
 },
 created() {
  ...
 },
 methods: {
 ...
 }
};
</script>

-->
<script>
export default {
  data() {
    return {
      chatHistory: [],
      messageText: "",
      placeholderAvatar: "",
      isLoading: false,
    };
  },
  mounted() {
    this.loadPreviousMessages();
    this.listenForNewMessages();
  },
  methods: {
    loadPreviousMessages() {
      this.isLoading = true;
      const mockRequest = this.createMessageRequest(100);

      mockRequest.then(
        (messages) => {
          this.chatHistory = [...this.chatHistory, ...messages];
          this.isLoading = false;
          this.scrollToLatest();
        },
        (err) => {
          console.error("Faled to fetch messages: ", err);
          this.isLoading = false;
        }
      );
    },

    listenForNewMessages() {
      const listenerID = "CHAT_LISTENER";
      this.addMessageListener(listenerID, {
        onMessageReceived: (msg) => {
          this.chatHistory = [...this.chatHistory, msg];
          this.scrollToLatest();
        },
      });
    },

    submitMessage() {
      if (!this.messageText.trim()) return;
      const msgContent = this.messageText.trim();
      const receiver = "GROUP_CHAT";
      const newMessage = this.createTextMessage(receiver, msgContent);

      this.sendMessage(newMessage).then(
        (msg) => {
          this.chatHistory.push(msg);
          this.messageText = "";
          this.scrollToLatest();
        },
        (err) => {
          console.error("Message failed to send!! ", err);
        }
      );
    },

    scrollToLatest() {
      this.$nextTick(() => {
        const chatBox = this.$refs.chatBox;
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    },

   
    createMessageRequest(limit) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([]), 1000); // Simulate API call
      });
    },

    addMessageListener(listenerID, { onMessageReceived }) {
      setInterval(() => {
        const sampleMsg = {
          id: Date.now(),
          sender: { username: "co", avatar: this.placeholderAvatar },
          text: "Se",
        };
        onMessageReceived(sampleMsg);
      }, 5000);
    },

    createTextMessage(receiver, text) {
      return { id: Date.now(), sender: { username: "Me" }, text };
    },

    sendMessage(msg) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(msg), 500); 
      });
    },
  },
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 15px;
  background-color: #f0f0f0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 15px;
}

.chat-entry {
  display: flex;
  margin-bottom: 10px;
}

.avatar-wrapper img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-body {
  background: #e8e8e8;
  padding: 10px;
  border-radius: 8px;
}

.username {
  font-weight: bold;
  margin-bottom: 5px;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.chat-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:  0.3s;
}

.chat-input button:hover {
  background: #0056b3;
}
</style>
