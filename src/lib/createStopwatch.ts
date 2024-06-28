import store from "./tinybase"


export default function createStopwatch() {
    const now = Date.now()
    const newId = store.addRow("stopwatches", {
        title: "Stopwatch",
        startTime: now,
        // paused: false,
        // lastPausedTime: -1,
        paused: true,
        lastPausedTime: now,
        pausedTime: 0,
        previousTimes: "[]",
    })
    
    return newId
}