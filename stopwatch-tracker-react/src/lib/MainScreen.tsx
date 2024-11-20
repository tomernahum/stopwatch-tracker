
import { Stopwatch } from './Stopwatch'
import { store, UiReactWithSchemas } from './tinybase-store'
const { useRowIds } = UiReactWithSchemas

export default function MainScreen() {

    const stopwatchRowIds = useRowIds("stopwatches")


    function createStopwatch() {

        const id = crypto.randomUUID()
    
        const now = Date.now()
        const newId = store.setRow("stopwatches", id, {
            title: "Stopwatch",
            startTime: now,
            // paused: false,
            // lastPausedTime: -1,
            paused: true,
            lastPausedTime: now,
            pausedTimeCount: 0,
        })
        
        return newId
    }

    return (
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-10 w-fit mx-auto">

            {stopwatchRowIds.map((stopwatchId) => (
                <Stopwatch key={stopwatchId} stopwatchId={stopwatchId} />
            ))}

            {/* Create Stopwatch Button */}
            <button
                onClick={createStopwatch}
                className="min-w-64 min-h-80 border-2 rounded-md"
            >
                +
            </button>
        </div>
    )
}
