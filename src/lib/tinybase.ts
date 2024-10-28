import { browser, dev } from '$app/environment';
import { createMergeableStore, createIndexes } from 'tinybase';
// import { createIndexes, createStore } from 'tinybase/with-schemas'; 
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';

// Create TinyBase Store

function createTinyBaseStore(
    {sync=true, roomId=''}: 
    {sync?: boolean, roomId?: string}
) {

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
    

    // const roomId = new URLSearchParams(window.location.search).get('roomId') || 'defaultRoom';
    console.log('Using roomId', roomId)

    // local storage persister (can't be done in server/prerendering enviornment)
    const persister = createLocalPersister(store, `stopwatch-tracker-data-room-${roomId}`, (ignorredError)=>console.warn(ignorredError));
    persister.startAutoLoad(defaultStoreData).then(()=>{
        persister.startAutoSave();
    })

    // synchronization!!

    // const SYNC_BASE_URL = 'ws://localhost:8050' as const;
    const SYNC_BASE_URL = "wss://stopwatch-tracker-tinybase-backend.coolify.ttools.io" as const;
    // const x = import.meta.env.Mode == "development" ? 'ws://localhost:8050' : "prod_url_here"

    if (sync) {
        createWsSynchronizer(
            store,
            new WebSocket(`${SYNC_BASE_URL}/${roomId}`),
        ).then((synchronizer)=>{
            synchronizer.startSync()
            console.log('Synchronizer connected &  started')
            // BUG: sometimes only syncs once a piece of data is mutated
        })
        .catch((error)=>{
            console.warn("error starting synchronizer (maybe the server is down?), reload page to try again (should merge your timers)", error)
            //TODO retry every X seconds
        })
    }
    


    return {store, indexes, persister}
}




const roomId = new URLSearchParams(window.location.search).get('room');


const {store, indexes, persister} = roomId ? createTinyBaseStore({sync: true, roomId}) : createTinyBaseStore({sync: false, roomId:'local'})
// todo add a share button





export default store
export {indexes}