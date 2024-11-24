<template>
  <div class="success-page">
    <div class="checkmark-container">
      <i class="fas fa-check-circle checkmark-icon"></i>
    </div>
    <h1>Event Successfully Created!</h1>
    <p>Your event has been added successfully.</p>
  </div>
</template>

<script>
export default {
  name: 'EventCreatedPage',
};
</script>

<style scoped>
.success-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffe4e1; /* Light pink background */
}

.checkmark-container {
  margin-bottom: 20px;
}

.checkmark-icon {
  font-size: 80px;
  color: #ff69b4; /* Pink checkmark */
}

h1 {
  color: #ff1493; /* Deep pink text */
  font-size: 24px;
}

p {
  font-size: 16px;
  color: #000000;
}
</style>
