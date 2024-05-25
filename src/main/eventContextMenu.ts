import { BrowserWindow, Menu, MenuItem } from 'electron';
import { CalendarEvent } from '../types.js';
import { EventsManager } from './data/events.js';

export function createEventContextMenu(event: CalendarEvent, eventsManager: EventsManager, win: BrowserWindow): Menu {
    const menu = new Menu();
    
    menu.append(new MenuItem({
        label: 'Modifica...',
        accelerator: 'm',
        async click() {
            win.webContents.send('ui@events:show-form', event);
        }
    }));
    
    menu.append(new MenuItem({
        label: 'Duplica...',
        accelerator: 'd',
        async click() {
            const { id, ...eventData } = event;
            
            const copyIndicator = eventData.title.match(/ \(([0-9]*)\)$/);
            
            if (copyIndicator && copyIndicator[1]) {
                let copyNumber = Number(copyIndicator[1]);
                
                const title = eventData.title.substring(
                    0,
                    event.title.length - copyIndicator[0].length
                );
                
                eventData.title = `${title} (${++copyNumber})`;
            }
            
            win.webContents.send('ui@events:show-form', eventData);
        }
    }));
    
    menu.append(new MenuItem({ type: 'separator' }));
    
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
