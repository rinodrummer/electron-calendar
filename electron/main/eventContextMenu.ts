import { BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import { CalendarEvent } from '../../types.js';
import { EventsManager } from './data/events.js';

export function createEventContextMenu(event: CalendarEvent, eventsManager: EventsManager, win: BrowserWindow): Menu {
    const menu = new Menu();
    
    menu.append(new MenuItem({
        label: 'Elimina',
        accelerator: 'e',
        async click() {
            await eventsManager.deleteEvents(event.id);
            win.webContents.send('ui@events:refresh');
        }
    }));
    
    return menu;
}
