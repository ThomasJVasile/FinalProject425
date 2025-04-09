<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-5" elevation="10">
      <v-card-title class="text-center">
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        Register Now
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="register">
          <v-text-field v-model="firstName" label="First Name" outlined dense required></v-text-field>

          <v-text-field v-model="lastName" label="Last Name" outlined dense required></v-text-field>

          <v-text-field v-model="email" label="Email" outlined dense type="email" required></v-text-field>

          <v-text-field v-model="username" label="Username" outlined dense required></v-text-field>

          <v-text-field v-model="password" label="Password" outlined dense type="password" required></v-text-field>

          <v-text-field v-model="confirmpassword" label="Confirm Password" outlined dense type="password"
            required></v-text-field>

          <v-alert v-if="errorMessage" type="error" class="mt-3">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="successMessage" type="success" class="mt-3">
            {{ successMessage }}
          </v-alert>

          <v-btn block color="primary" class="mt-3" type="submit">
            Register Now
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { db } from "@/firebase";
import { ref, onMounted } from "vue";
// import { useRouter } from "vue-router";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

export default {
  setup() {
    // const router = useRouter();
    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const confirmpassword = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const users = ref([]);

    const register = async () => {
      if (!firstName.value || !lastName.value || !email.value || !username.value || !password.value || !confirmpassword.value) {
        errorMessage.value = "Please fill out all fields.";
        return;
      }

      if (password.value !== confirmpassword.value) {
        errorMessage.value = "Passwords do not match.";
        return;
      }

      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const { user } = userCredential;
        await sendEmailVerification(user);
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName.value,
          lastName: lastName.value,
          username: username.value,
          email: email.value,
        });
        await auth.signOut();
        successMessage.value = `A verification email has been sent to ${email.value}. Please check your inbox.`;


      } catch (error) {
        errorMessage.value = "Registration failed: " + error.message;
        successMessage.value = "";
        email.value = "";
        password.value="";
        confirmpassword.value="";

      }
    };

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        users.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      firstName,
      lastName,
      email,
      username,
      password,
      confirmpassword,
      errorMessage,
      successMessage,
      users,
      register,
    };
  },
};
</script>

<style scoped>
.v-card-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.wider-card {
  max-width: 650px !important;
  width: 100%;
}
</style>
