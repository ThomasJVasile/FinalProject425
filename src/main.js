import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 
import EmojiPicker from "vue3-emoji-picker";
import '@fortawesome/fontawesome-free/css/all.css';
import '@mdi/font/css/materialdesignicons.css';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Configure Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        dark: false, // Light theme for a clean look
        colors: {
          primary: '#1E3A8A',   // Deep blue for a strong, professional feel
          secondary: '#F59E0B', // Warm gold for accents (buttons, highlights)
          background: '#F3F4F6', // Soft gray for a subtle, modern UI
          surface: '#FFFFFF',   // White surfaces for better contrast
          accent: '#2563EB',    // Lighter blue for small highlights
          error: '#EF4444',     // Red for error messages
          info: '#3B82F6',      // Blue for informational messages
          success: '#10B981',   // Green for success states
          warning: '#FBBF24',   // Yellow-orange for warnings
        },
      },
    },
  },
});

createApp(App).use(router).use(vuetify).use(EmojiPicker).mount('#app'); 

App.component('EmojiPicker', EmojiPicker);
//lalise