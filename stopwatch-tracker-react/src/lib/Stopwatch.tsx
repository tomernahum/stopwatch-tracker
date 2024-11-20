import { useEffect, useState } from "react";
import { store, UiReactWithSchemas } from "./tinybase-store";
const { useCell } = UiReactWithSchemas;

const REFRESH_RATE = 16; // milliseconds. //can make this into a editable setting

export function Stopwatch(params: { stopwatchId: string }) {
    let title = useCell("stopwatches", params.stopwatchId, "title")!;
    let startTime = useCell("stopwatches", params.stopwatchId, "startTime")!;
    let paused = useCell("stopwatches", params.stopwatchId, "paused")!;
    let pausedTimeCount = useCell(
        "stopwatches",
        params.stopwatchId,
        "pausedTimeCount"
    )!;
    let lastPausedTime = useCell(
        "stopwatches",
        params.stopwatchId,
        "lastPausedTime"
    )!;

    let [currentTime, setCurrentTime] = useState(Date.now());
    let elapsedTimeMillis = paused
        ? lastPausedTime! - startTime - pausedTimeCount
        : currentTime - startTime - pausedTimeCount;

    useEffect(() => {
        const interval = setInterval(
            () => setCurrentTime(Date.now()),
            REFRESH_RATE
        );
        return () => {
            clearInterval(interval);
        };
    }, []);

    function onDeleteButtonPressed() {
        const confirmDelete = confirm(`Delete "${title}?"`);
        if (!confirmDelete) return;

        store.delRow("stopwatches", params.stopwatchId);
    }

    return (
        <div className="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit h-fit relative">
            <h1 className="text-xl text-[1.unitsToDisplayStringnter  decoration-1 font-semibold text-center">
                <div> {title}</div>
                {/* todo: make contenteditale */}
            </h1>

            <button
                className="bg-red-600 border-2  text-white   border-black dark:border-neutral-300 rounded-sm  hover:brightness-125 py-0 px-1 font-mono rounded-sm text-sm absolute right-2 top-2"
                onClick={onDeleteButtonPressed}
            >
                X
            </button>

            <div className="pt-3"></div>

            <TimeDisplay elapsedTimeMillis={elapsedTimeMillis} />

            <div class="pt-3"></div>

            <button
                onClick={() =>
                    store.setCell("stopwatches", params.stopwatchId, "paused", false)
                }
            >
                start
            </button>
        </div>
    );
}

function TimeDisplay(params: { elapsedTimeMillis: number }) {
    let elapsedTimeMillis = params.elapsedTimeMillis;
    let elapsedTimeUnits = msToUnits(elapsedTimeMillis);
    let timeDisplay = unitsToDisplayStrings(elapsedTimeUnits);

    function Colon(params: { className?: string } = { className: "" }) {
        return (
            <span className={`${params.className} font-['Inter_Variable']`}>:</span>
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

function StopwatchButtons(params: {
    stopwatchId: string;
    elapsedTimeMillis: number;
}) {
    const paused = useCell("stopwatches", params.stopwatchId, "paused")!;
    const lastPausedTime = useCell(
        "stopwatches",
        params.stopwatchId,
        "lastPausedTime"
    )!;
    const pausedTimeCount = useCell(
        "stopwatches",
        params.stopwatchId,
        "pausedTimeCount"
    )!;

    function unpause() {
        const now = Date.now();
        if (lastPausedTime === -1) throw new Error("Timer is not paused");

        const newTime = pausedTimeCount + (now - lastPausedTime);
        store.transaction(() => {
            store.setCell(
                "stopwatches",
                params.stopwatchId,
                "pausedTimeCount",
                newTime
            );

            store.setCell("stopwatches", params.stopwatchId, "paused", false);

            store.setCell("stopwatches", params.stopwatchId, "lastPausedTime", -1);
        });

        // currentTime = Date.now();
    }
    function pause() {
        const now = Date.now()
        store.transaction(() => {
            store.setCell('stopwatches', params.stopwatchId, 'lastPausedTime', now)
            store.setCell('stopwatches', params.stopwatchId, 'paused', true)
        })
    }

    const controlButtonCSS = "border-2 border-black dark:border-neutral-300 rounded-md text-white  min-w-24 px-1 py-1 pb-1.5"
    return (
        <div className="flex gap-3 items-center justify-evenly flex-wrap">
            {paused ? (
                <button className="control-button bg-lime-700" onClick={unpause}>
                    Resume
                </button>
            ) : (
                <button
                    className="control-button bg-rose-700"
                    onClick={pause}
                >
                    Pause
                </button>
            )}
        </div>
    );
}

function msToUnits(ms: number) {
    return {
        milliseconds: Math.floor(ms % 1000),
        seconds: Math.floor((ms / 1000) % 60),
        minutes: Math.floor((ms / (1000 * 60)) % 60),
        hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    };
}
function unitsToDisplayStrings(elapsedTimeUnits: ReturnType<typeof msToUnits>) {
    return {
        milliseconds: elapsedTimeUnits.milliseconds.toString().padStart(3, "0"),
        seconds: elapsedTimeUnits.seconds.toString().padStart(2, "0"),
        minutes: elapsedTimeUnits.minutes.toString().padStart(2, "0"),
        hours: elapsedTimeUnits.hours.toString().padStart(2, "0"),
        days: elapsedTimeUnits.days.toString().padStart(2, "0"),
    };
}
