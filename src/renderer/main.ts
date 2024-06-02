import { Settings } from 'luxon';
import { createApp } from 'vue';
import App from './App.vue';

import './style.css';

Settings.defaultLocale = navigator.language;
Settings.defaultZone = 'system';

createApp(App)
    .mount('#app')
    .$nextTick(() => {
        postMessage({ payload: 'removeLoading' }, '*');
    });
