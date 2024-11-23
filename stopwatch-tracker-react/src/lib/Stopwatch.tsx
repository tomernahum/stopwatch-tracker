import { useEffect, useState } from "react";
import { indexes, store, UiReactWithSchemas } from "./tinybase-store";
import { assumeDefined, msToUnits, unitsToDisplayStrings } from "./utils";
import StopwatchHistoryDisplay from "./StopwatchHistoryDisplay";
import ErrorBoundary from "./ErrorBoundary";
const { useCell } = UiReactWithSchemas;



export function Stopwatch(props: { stopwatchId: string }) {
    let title = assumeDefined(useCell("stopwatches", props.stopwatchId, "title"))
    let startTime = assumeDefined(useCell("stopwatches", props.stopwatchId, "startTime"))
    let paused = assumeDefined(useCell("stopwatches", props.stopwatchId, "paused"))
    let pausedTimeCount = assumeDefined(useCell("stopwatches",props.stopwatchId,"pausedTimeCount"))
    let lastPausedTime = assumeDefined(useCell("stopwatches", props.stopwatchId, "lastPausedTime"))

    let currentTime = useCurrentTime(); // causes a refresh every X milliseconds
    
    
    let elapsedTimeMillis = (paused ? lastPausedTime : currentTime) - startTime - pausedTimeCount

        // 


    function onDeleteButtonPressed() {
        const confirmDelete = confirm(`Delete "${title}"? This is permanent.`);
        if (!confirmDelete) return;

        
        store.delRow("stopwatches", props.stopwatchId);

        // delete all associated history
        const relevantHistoryRowIds = indexes.getSliceRowIds("byStopwatchId", props.stopwatchId);
        relevantHistoryRowIds.forEach(id => {
            store.delRow("stopwatchHistory", id);
        })
        
    }

    
    // if (!stopwatchExists) throw new Error("Stopwatch does not exist");
    return (
        <div className="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit h-fit relative">
            <button
                className="bg-red-600 border-2  text-white   border-black dark:border-neutral-300 rounded-sm  hover:brightness-125 py-0 px-1 font-mono text-sm absolute right-2 top-2"
                onClick={onDeleteButtonPressed}
            >
                X
            </button>

            <Title stopwatchId={props.stopwatchId} />

            

            <div className="pt-3"></div>
            {/* <p>time:{currentTime}, startTime:{startTime}</p>
            <p>c-st: {currentTime - startTime}</p>
            <p>pausedTimeCount:{pausedTimeCount}, lastPausedTime:{lastPausedTime}</p> */}

            <TimeDisplay elapsedTimeMillis={elapsedTimeMillis} />

            <div className="pt-3"></div>

            <StopwatchButtons stopwatchId={props.stopwatchId} elapsedTimeMillis={elapsedTimeMillis} />

            <div className="pt-3"></div>

            <ErrorBoundary>
                <StopwatchHistoryDisplay stopwatchId={props.stopwatchId} />
            </ErrorBoundary>
        </div>
    );
}


function Title(props: { stopwatchId: string }) {


    const [titleInput, setTitleInput] = useState(assumeDefined(store.getCell("stopwatches", props.stopwatchId, "title")));

    function editTitle(text: string) {
        setTitleInput(text);
        store.setCell("stopwatches", props.stopwatchId, "title", text);
        
    }

    store.addCellListener("stopwatches", props.stopwatchId, "title", () => {
        const newTitle = assumeDefined(store.getCell("stopwatches", props.stopwatchId, "title"));
        setTitleInput(newTitle);
    })

    return (
        <h1 className="text-xl decoration-1 font-semibold text-center">
            <input
                type="text"
                value={titleInput}
                onChange={(e) => {
                    e.preventDefault();
                    editTitle(e.target.value);
                }}
                style={{
                    border: 'none',
                    outline: 'none',
                    background: 'none',
                    textAlign: 'center',
                    width: '100%'
                }}
            />
        </h1>
    )
}




const REFRESH_RATE = 16; // milliseconds. //potential: can make this into a editable setting
function useCurrentTime(){
    //credit to react docs https://codesandbox.io/p/sandbox/rxhzkx?file=%252Fsrc%252FApp.js%253A14%252C1 for idea to be a hook
    // could make it a context provider so that all components can use the same instance of it.
    
    // const [currentTime, setCurrentTime] = useState(Date.now());
    let currentTime = Date.now();


    const [refreshTriggerer, setRf] = useState(false)
    function triggerRerender(){
        setRf((p)=>!p)
    }
    // need to do it like this instead of w/ useState(date.now) because otherwise cell values (ie startime) may update and cause a rerender before currentTime is updated, and cause the timer to have a flash of incorrect information
    // this way currentTime is automatically fetched on each render, and just forced to rerender every X millis. 
    
    // maybe I could also make this a provider or a singleton or something and have another function like makeCurrentTimeUpToDate(). But i think this works fine
    
    
    
    useEffect(() => {
        const interval = setInterval(
            () =>{
                // setCurrentTime(Date.now())
                // currentTime = Date.now() // not needed
                triggerRerender()
            },
            REFRESH_RATE
        );
        return () => {
            clearInterval(interval);
        };
    }, []);
    
    return currentTime
}



function TimeDisplay(props: { elapsedTimeMillis: number }) {
    let elapsedTimeMillis = props.elapsedTimeMillis;
    let elapsedTimeUnits = msToUnits(elapsedTimeMillis);
    let timeDisplay = unitsToDisplayStrings(elapsedTimeUnits);

    function Colon(props: { className?: string } = { className: "" }) {
        return (
            <span className={`${props.className} font-['Inter_Variable']`}>:</span>
        );
    }

    return (
        // todo tidy/change classNames
        <p className="border-2 border-black dark:border-neutral-300 rounded-md text-5xl px-4 py-1 bg-stone-300 dark:bg-stone-600 w-fit  text-center m-auto font-['Noto_Mono']">
            {elapsedTimeUnits.days > 0 && (
                <span>
                    {timeDisplay.days}
                    <Colon />
                </span>
            )}
            {timeDisplay.hours}
            <Colon className={""} />
            {timeDisplay.minutes}
            <Colon />
            {timeDisplay.seconds}
            <span className="text-base">.</span>
            <span className="text-xs">{timeDisplay.milliseconds}</span>
        </p>
    );
}

function StopwatchButtons(props: {
    stopwatchId: string;
    elapsedTimeMillis: number;
}) {
    const paused = useCell("stopwatches", props.stopwatchId, "paused")!;

    // used in functions, doesnt need to be a hook
    // const lastPausedTime = useCell( "stopwatches",  props.stopwatchId, "lastPausedTime")!;
    // const pausedTimeCount = useCell("stopwatches", props.stopwatchId, "pausedTimeCount")!;
    // const startTime = useCell("stopwatches", props.stopwatchId, "startTime")!;

    

    function pause() {
        const now = Date.now() // should it begetCurrentTime from context?
        store.transaction(() => {
            store.setCell('stopwatches', props.stopwatchId, 'lastPausedTime', now)
            store.setCell('stopwatches', props.stopwatchId, 'paused', true)
        })
    }
    function unpause() {
        const now = Date.now();
        
        store.transaction(() => {
            const lastPausedTime = assumeDefined(store.getCell('stopwatches', props.stopwatchId, 'lastPausedTime'))
            const pausedTimeCount = assumeDefined(store.getCell('stopwatches', props.stopwatchId, 'pausedTimeCount'))
            
            if (lastPausedTime === -1) throw new Error("Timer is not paused");

            const newTime = pausedTimeCount + (now - lastPausedTime);
            store.setCell("stopwatches", props.stopwatchId, "pausedTimeCount", newTime);

            store.setCell("stopwatches", props.stopwatchId, "paused", false);

            store.setCell("stopwatches", props.stopwatchId, "lastPausedTime", -1);
        });

        // currentTime = Date.now();
    }

    function reset() {
        const now = Date.now()

        store.transaction(() => {

            const paused = store.getCell('stopwatches', props.stopwatchId, 'paused') ?? (()=>{throw new Error("Timer is not paused")})()
            const lastPausedTime = store.getCell('stopwatches', props.stopwatchId, 'lastPausedTime')!
            const pausedTimeCount = store.getCell('stopwatches', props.stopwatchId, 'pausedTimeCount')!
            const startTime = store.getCell('stopwatches', props.stopwatchId, 'startTime')!
            



            store.setCell('stopwatches', props.stopwatchId, 'startTime', now)
            store.setCell('stopwatches', props.stopwatchId, 'pausedTimeCount', 0)

            if (paused) {
                store.setCell('stopwatches', props.stopwatchId, 'lastPausedTime', now)
            }
            else {
                store.setCell('stopwatches', props.stopwatchId, 'lastPausedTime', -1)
            }

            // auto pause after reset, still considering whether to keep this
            store.setCell('stopwatches', props.stopwatchId, 'paused', true)
            store.setCell('stopwatches', props.stopwatchId, 'lastPausedTime', now)

            // Save to history
            // should be good but slight chance of some kind of race condition here
            store.addRow('stopwatchHistory', {
                stopwatchId: props.stopwatchId,
                elapsedTimeCount: (paused ? (lastPausedTime! - startTime - pausedTimeCount) : (now - startTime - pausedTimeCount)), // WET with elapsedTimeMillis,
                startTime: startTime,
                endTime: now,
                pausedTimeCount: pausedTimeCount,
            })
            
        })

        // currentTime = Date.now();
    }
    

    const controlButtonCSS = "border-2 border-black dark:border-neutral-300 rounded-md text-white  min-w-24 px-1 py-1 pb-1.5"
    return (
        <div className="flex gap-3 items-center justify-evenly flex-wrap">
            {paused ? (
                (props.elapsedTimeMillis > 0) ? (
                    <button className={`${controlButtonCSS} bg-lime-700`} onClick={unpause}>
                        Resume
                    </button>
                ):
                (
                    <button className={`${controlButtonCSS} bg-lime-700`} onClick={unpause}>
                        Start
                    </button>
                )
            ) : (
                <button className={`${controlButtonCSS} bg-lime-600`} onClick={pause}>
                    Pause
                </button>
            )}


            <button className={`${controlButtonCSS} bg-red-600`} onClick={reset}>
                Reset
            </button>
        </div>
    );
}


