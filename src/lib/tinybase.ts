import { browser, dev } from '$app/environment';
import { createIndexes, createStore } from 'tinybase/with-schemas';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

// Create TinyBase Store

const store = createStore().setTablesSchema({
    stopwatches: {
        title: {type: 'string'},
        startTime: {type: 'number'},
        paused: {type: 'boolean'},
        lastPausedTime: {type: 'number', default: -1},
        pausedTimeCount: {type: 'number', default: 0},
    },

    stopwatchHistory: {
        stopwatchId: {type: 'string'},

        elapsedTimeCount: {type: 'number'},
        startTime: {type: 'number'},
        endTime: {type: 'number'},
        pausedTimeCount: {type: 'number'},
    }

});

// TODO can define relationships explicitly

export const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'byStopwatchId', // indexId
  'stopwatchHistory', //      tableId to index
  'stopwatchId', //    cellId to index on
  'endTime', //    cellId to sort by
);
// eg console.log(indexes.getSliceRowIds('byStopwatchId', '0')); //-> list of stopwatchHistory IDs belonging to that stopwatch ID


const defaultStoreData = {
    stopwatches: {
        "0": {
            title: "Stopwatch",

            startTime: Date.now(),
            paused: false,
            lastPausedTime: -1,
            pausedTimeCount: 0,
        },
    },

    stopwatchHistory: {},
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