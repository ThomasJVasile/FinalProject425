<!-- <template>
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
</template> -->

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="register-card elevation-12">
      <v-card-title class="text-h5 text-center font-weight-bold">
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        Register Now
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="register">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="firstName" label="First Name" prepend-inner-icon="mdi-account" dense outlined required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="lastName" label="Last Name" prepend-inner-icon="mdi-account" dense outlined required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="email" label="Email" type="email" prepend-inner-icon="mdi-email" dense outlined required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="username" label="Username" prepend-inner-icon="mdi-account-circle" dense outlined required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="password" label="Password" type="password" prepend-inner-icon="mdi-lock" dense outlined required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="confirmpassword" label="Confirm Password" type="password" prepend-inner-icon="mdi-lock-check" dense outlined required />
            </v-col>
          </v-row>

          <v-alert v-if="errorMessage" type="error" class="mt-3" dense text>
            {{ errorMessage }}
          </v-alert>
          <v-alert v-if="successMessage" type="success" class="mt-3" dense text>
            {{ successMessage }}
          </v-alert>

          <v-btn type="submit" color="primary" block class="mt-4">
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

.register-card {
  width: 100%;
  max-width: 500px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

</style>
