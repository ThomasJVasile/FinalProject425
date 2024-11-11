<template>
  <div>
    <h1>Register Now</h1>
    <form @submit.prevent="register">
      <label for="firstName">First Name:</label>
      <input v-model="firstName" type="text" id="firstName" required />
      <br />

      <label for="lastName">Last Name:</label>
      <input v-model="lastName" type="text" id="lastName" required />
      <br />

      <label for="email">Email:</label>
      <input v-model="email" type="email" id="email" required />
      <br />

      <label for="username">Username:</label>
      <input v-model="username" type="text" id="username" required />
      <br />

      <label for="password">Password:</label>
      <input v-model="password" type="password" id="password" required />
      <br />

      <label for="confirmpassword">Confirm Password:</label>
      <input v-model="confirmpassword" type="password" id="confirmpassword" required />
      <br />

      <button type="submit">Register Now</button>
    </form>

    <div class="user-list">
      <h2>Registered Users</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.firstName }} {{ user.lastName }} - {{ user.email }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/firebase";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

export default {
  setup() {
    const router = useRouter();
    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const confirmpassword = ref("");
    const users = ref([]);

    const register = async () => {
      if (!firstName.value || !lastName.value || !email.value || !username.value || !password.value || !confirmpassword.value) {
        alert("Please fill out all fields.");
        return;
      }

      if (password.value !== confirmpassword.value) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const { user } = userCredential;
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName.value,
          lastName: lastName.value,
          username: username.value,
          email: email.value,
        });

        alert("Registration successful.");
        router.push("/homepage");
      } catch (error) {
        alert("Registration failed: " + error.message);
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
      users,
      register,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  color: #42b983;
}
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
