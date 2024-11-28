<template>
    <div>
        <h1>Send Message</h1>
        <form @submit.prevent="SendMessage">
            <input v-model="ReceiverUsername" type="text" placeholder="Enter receiver's username" />
            <input v-model="Content" type="text" placeholder="Enter Message" />
            <button type="submit">Send Message</button>
        </form>
    </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp} from 'firebase/firestore'
import { getAuth } from 'firebase/auth';

export default {
    data() {
        return {
            Content: '',
            ReceiverUsername: '',
        };
    },
    methods: {
        async SendMessage() {
            const auth = getAuth();
            const SenderID = auth.currentUser ? auth.currentUser.uid : null;    
            if (!this.SenderID) {
                alert("You must be logged in to send a message.");
            }
            
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
                    alert("user not found.");
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
                alert("message sent");

                 
            } catch (error) {
                console.error("error sending message:", error);
                alert("failed to send message");
            }
        },
    },  
};


</script>