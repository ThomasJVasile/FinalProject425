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
import { collection, addDoc, serverTimestamp} from 'firebase/firestore'
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
            const SenderID = auth.currentUser;     
            if (this.ReceiverUsername.trim() === '') {
                alert("Enter receiver's username.");
                return;
            }
            if (this.Content.trim() === '') {
                alert("Message cannot be empty.");
                return;
            }
            
            try {
                const ReceiverReference = collection(db, 'users');
                 
            }

        },
    },  
};


</script>