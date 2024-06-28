import { browser, dev } from '$app/environment';
import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

// Create TinyBase Store
const store = createStore();
    
const defaultStoreData = {
    stopwatches: {
        "0": {
            startTime: Date.now(),
            paused: false,
            lastPausedTime: -1,
            pausedTimeCount: 0,
            
            previousTimes: "[]",


        },
    }
}

// register listeners for debugging
store.addValuesListener(() => console.log('valuesJson', store.getValues()));
store.addTablesListener(() => console.log('tablesJson', store.getTables()));

// local storage persister
if (browser) {
    
    const persister = createLocalPersister(store, 'stopwatch-tracker');
    await persister.startAutoLoad(defaultStoreData);
    await persister.startAutoSave();
}

export default { store };