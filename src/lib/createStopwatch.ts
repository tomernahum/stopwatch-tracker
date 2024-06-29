import store from "./tinybase"


export default function createStopwatch() {

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