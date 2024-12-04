<template>
  <div class="login-container">
    <div class = "login-box">
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
  color: #000000;
}
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.create-account-link:hover {
  text-decoration: underline;
}

.create-account-link {
  color: #007bff;
  text-decoration: none;
}

.create-account {
  margin-top: 20px;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}

</style>
