import { browser, dev } from '$app/environment';
import { createMergeableStore, createIndexes } from 'tinybase';
// import { createIndexes, createStore } from 'tinybase/with-schemas'; 
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

// Create TinyBase Store

export function createTinyBaseStore() {
    const store = createMergeableStore().setTablesSchema({
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

            group: {type: 'string', default: 'default'},
        }
    
    });
    
    // TODO can define relationships explicitly
    
    const indexes = createIndexes(store);
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
    }  // BUG broken (see type error later on)
    
    // register listeners for debugging
    store.addValuesListener(() => console.log('valuesJson', store.getValues()));
    store.addTablesListener(() => console.log('tablesJson', store.getTables()));
    
    // local storage persister (can't be done in server/prerendering enviornment)
        const persister = createLocalPersister(store, 'stopwatch-tracker-data', (ignorredError)=>console.warn(ignorredError));
        persister.startAutoLoad(defaultStoreData).then(()=>{
            persister.startAutoSave();
        })

    return {store, indexes, persister}
}

const {store, indexes, persister} = createTinyBaseStore()


export default store
export {indexes}