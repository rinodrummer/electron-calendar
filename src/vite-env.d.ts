/// <reference types="vite/client" />

import { DateTime } from 'luxon';

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module '@fullcalendar/core' {
    export * from '@fullcalendar/core';
    
    export const DateInput = BaseDateInput | DateTime;
}

declare global {
    interface Window {
        // expose in the `electron/preload/index.ts`
        ipcRenderer: import('electron').IpcRenderer;
        dt: {
            sqlOptions: import('luxon').ToSQLOptions
        }
    }
}
