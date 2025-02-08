import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 
import '@fortawesome/fontawesome-free/css/all.css';

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
        dark: false,
        colors: {
          primary: '#6200ea',
          secondary: '#03dac6',
          background: '#f5f5f5',
        },
      },
    },
  },
});

createApp(App).use(router).use(vuetify).mount('#app'); 
//lalise