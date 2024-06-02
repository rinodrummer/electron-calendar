import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { release } from 'node:os';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { Settings } from 'luxon';
import initDatabase from './database.js';
import { createEventContextMenu } from './eventContextMenu.js';

globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = dirname(__filename);

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = join(globalThis.__dirname, '../..');

export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.DIST_ELECTRON = MAIN_DIST;
process.env.DIST = RENDERER_DIST;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? join(process.env.APP_ROOT, 'public')
    : RENDERER_DIST;

Settings.defaultLocale = app.getLocale();
Settings.defaultZone = 'system';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) {
    app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
const preload = join(globalThis.__dirname, '../preload/index.mjs');
const indexHtml = join(RENDERER_DIST, 'index.html');

async function createWindow() {
    win = new BrowserWindow({
        title: 'Il tuo calendario',
        icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // nodeIntegration: true,
            
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            contextIsolation: true,
        },
    });
    
    if (VITE_DEV_SERVER_URL) { // #298
        win.loadURL(VITE_DEV_SERVER_URL);
        // Open devTool if the app is not packaged
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(indexHtml);
    }
    
    // Test actively push a message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });
    
    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    // win.webContents.on('will-navigate', (event, url) => { }) #344
}

initDatabase().then(({ useEvents, closeDatabase }) => {
    const eventsManager = useEvents();
    
    app.prependOnceListener('window-all-closed', async () => {
        await closeDatabase();
    });
    
    ipcMain.on('event:show-ctx-menu', (e, { event, position }) => {
        const ctxMenu = createEventContextMenu(event, eventsManager, win);
        
        ctxMenu.popup({
            window: win,
            ...position
        });
    });
    
    app.whenReady()
        .then(createWindow)
        .catch(err => console.error(err));
}).catch(err => console.error(err));

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) {
            win.restore();
        }
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    }
    else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    
    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    }
    else {
        childWindow.loadFile(indexHtml, { hash: arg })
    }
});
