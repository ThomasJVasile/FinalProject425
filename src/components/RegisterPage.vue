<template>
    <div>
        <h1> Register now </h1>
    </div>
    <form>
        <label for="email">Email:</label>
        <input type="text" id="email" name="email"/>
        <br>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"/>
        <br>
        <label for="password">Password:</label>
        <input type="text" id="password" name="password"/>
        <br>
        <label for="confirmpassword">Confirm Password:</label>
        <input type="text" id="confirmpassword" name="confirmpassword"/>
        <br>
        <button type="submit">Register Now</button>
    </form>
</template>


<script>
export default {
  name: 'RegisterPage',
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
