import { browser, dev } from '$app/environment';
import { createStore } from 'tinybase/with-schemas';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

// Create TinyBase Store
const store = createStore().setTablesSchema({
    stopwatches: {
        title: {type: 'string'},
        startTime: {type: 'number'},
        paused: {type: 'boolean'},
        lastPausedTime: {type: 'number', default: -1},
        pausedTime: {type: 'number', default: 0},
        previousTimes: {type: 'string', default: "[]"},
    },
});
    
const defaultStoreData = {
    stopwatches: {
        "0": {
            title: "Stopwatch 1",

            startTime: Date.now(),
            paused: false,
            lastPausedTime: -1,
            pausedTime: 0,
            
            previousTimes: "[]",
        },
    }
}

// register listeners for debugging
store.addValuesListener(() => console.log('valuesJson', store.getValues()));
store.addTablesListener(() => console.log('tablesJson', store.getTables()));

// local storage persister
if (browser) {
    const persister = createLocalPersister(store, 'stopwatch-tracker-data');
    await persister.startAutoLoad(defaultStoreData);
    await persister.startAutoSave();
}

export default store ;