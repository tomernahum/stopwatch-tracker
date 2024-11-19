
import { createMergeableStore, createIndexes } from 'tinybase/with-schemas'; 
import { createLocalPersister } from 'tinybase/persisters/persister-browser/with-schemas';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client/with-schemas';
import * as UiReact from 'tinybase/ui-react/with-schemas';

// Create TinyBase Store

function createTinyBaseStore(
    {sync=true, roomId=''}: 
    {sync?: boolean, roomId?: string}
) {
    const tablesSchema = {
        stopwatches: {
            title: {type: 'string', },
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
    
    } as const
    const valuesSchema = {} as const


    const store = createMergeableStore().setTablesSchema(tablesSchema)
    
    // TODO can define relationships explicitly
    
    const indexes = createIndexes(store);
    indexes.setIndexDefinition(
      'byStopwatchId', // indexId
      'stopwatchHistory', //      tableId to index
      'stopwatchId', //    cellId to index on
      'endTime', //    cellId to sort by
    );
    // eg console.log(indexes.getSliceRowIds('byStopwatchId', '0')); //-> list of stopwatchHistory IDs belonging to that stopwatch ID
    
    
    const defaultStoreData = [{
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
    },{}] as const
    
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



    // const SYNC_BASE_URL = 'ws://localhost:8050' as const;
    // const SYNC_BASE_URL = "wss://stopwatch-tracker-tinybase-backend.coolify.ttools.io" as const;
    const SYNC_BASE_URL = import.meta.env.DEV ? 'ws://localhost:8050' : "wss://stopwatch-tracker-tinybase-backend.coolify.ttools.io"

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
    


    // UI React
    const UiReactWithSchemas = UiReact as UiReact.WithSchemas<
        [typeof tablesSchema, typeof valuesSchema]
    >;

    return {store, indexes, persister, UiReactWithSchemas}
}




const roomId = new URLSearchParams(window.location.search).get('room');
const newMerge = new URLSearchParams(window.location.search).get('newMerge') === 'true';


const {store, indexes, persister, UiReactWithSchemas} = roomId ? createTinyBaseStore({sync: true, roomId}) : createTinyBaseStore({sync: false, roomId:'local'})
// todo add a share button

if (newMerge) {
    const {store: localStore} = createTinyBaseStore({sync: false, roomId:'local'})
    store.merge(localStore)

    // delete the newMerge query param
    
    const url = new URL(window.location.href);
    url.searchParams.delete('newMerge');
    window.history.replaceState({}, '', url.toString());
}




export default store
export {store, indexes, UiReactWithSchemas}

// Could also do export const { ...rest } = UiReactWithSchemas in a seperate file to get 1 line import