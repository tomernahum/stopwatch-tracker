<!-- Please client render pages with this component -->
<script lang="ts">
	import { browser, building, dev } from "$app/environment";
    import store from "$lib/tinybase"
	import { onMount } from "svelte";
	import StopwatchHistoryDisplay from "./StopwatchHistoryDisplay.svelte";
	import { msToUnits, unitsToDisplayString } from "./stopwatch";

    type Milliseconds = number 

    let {
        stopwatchId,
        refreshRate=9
    }: {
        stopwatchId: string,
        refreshRate?: Milliseconds  
    } = $props() // annoying that you are forced to write every prop twice to type it in svelte 5.


    if (!browser && !building) {
        throw new Error("this component can only be rendered in the browser")
    }
    
    //--------DB Data----------
    let startTime = $state(store.getCell('stopwatches', stopwatchId, "startTime")!)
    let paused = $state(store.getCell('stopwatches', stopwatchId, "paused")!)
    let title = $state(store.getCell('stopwatches', stopwatchId, "title")!)
    let lastPausedTime = $state(store.getCell('stopwatches', stopwatchId, "lastPausedTime")!)
    let pausedTimeCount = $state(store.getCell('stopwatches', stopwatchId, "pausedTimeCount")!)
    
    if (
        startTime === undefined || paused === undefined || title === undefined || lastPausedTime === undefined || pausedTimeCount === undefined
    ) {
        console.warn({
            startTime, paused, title, lastPausedTime, pausedTimeCount
        })
        throw new Error('something was undefined in timer data')
    }
    

    $effect(() => {
        
        const startTimeListener = store.addCellListener(
            'stopwatches', stopwatchId, 'startTime',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                startTime = newCell
            },
        );
        const pausedListener = store.addCellListener(
            'stopwatches', stopwatchId, 'paused',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                paused = newCell
            },
        );
        const titleListener = store.addCellListener(
            'stopwatches', stopwatchId, 'title',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                title = newCell
            },
        );
        const lastPausedTimeListener = store.addCellListener(
            'stopwatches', stopwatchId, 'lastPausedTime',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                lastPausedTime = newCell
            },
        );
        const pausedTimeCountListener = store.addCellListener(
            'stopwatches', stopwatchId, 'pausedTimeCount',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                pausedTimeCount = newCell
            },
        );

        console.log({
            startTime, paused, title, lastPausedTime, pausedTimeCount})

        return () => {
            store.delListener(startTimeListener)
            store.delListener(pausedListener)
            store.delListener(titleListener)
            store.delListener(lastPausedTimeListener)
            store.delListener(pausedTimeCountListener)
        }

    })
    //binding title to store. not sure if good idea or not
    $effect (() => {
        if (title !== undefined) {
            store.setCell('stopwatches', stopwatchId, 'title', title)
        }
    })
    //------------
    


    let currentTime = $state(Date.now());
    
    let elapsedTimeMillis = $derived(paused ? lastPausedTime! - startTime - pausedTimeCount : currentTime - startTime - pausedTimeCount)


    //first time
    

    $effect(() => {
        if (paused) {
            return
        }

        const interval = setInterval(() => {
            currentTime = Date.now();
            // console.log("u")
        }, refreshRate)

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			clearInterval(interval);
		};
	});

    function pause() {
        const now = Date.now()
        store.transaction(() => {
            store.setCell('stopwatches', stopwatchId, 'lastPausedTime', now)
            store.setCell('stopwatches', stopwatchId, 'paused', true)
        })
    }

    function unpause() {
        const now = Date.now()
        if (lastPausedTime === -1)
            throw new Error('Timer is not paused')


        store.transaction(() => {
            store.setCell('stopwatches', stopwatchId, 'pausedTimeCount', pausedTimeCount + (now - lastPausedTime))

            store.setCell('stopwatches', stopwatchId, 'paused', false)

            store.setCell('stopwatches', stopwatchId, 'lastPausedTime', -1)
        })
        
        currentTime = Date.now();
        
    }

    function reset(){
        const now = Date.now()

        store.transaction(() => {
            store.setCell('stopwatches', stopwatchId, 'startTime', now)
            store.setCell('stopwatches', stopwatchId, 'pausedTimeCount', 0)

            if (paused) {
                store.setCell('stopwatches', stopwatchId, 'lastPausedTime', now)
            }
            else {
                store.setCell('stopwatches', stopwatchId, 'lastPausedTime', -1)
            }

            // auto pause after reset, still considering whether to keep this
            store.setCell('stopwatches', stopwatchId, 'paused', true)
            store.setCell('stopwatches', stopwatchId, 'lastPausedTime', now)

            // Save to history
            // should be good but slight chance of some kind of race condition here
            store.addRow('stopwatchHistory', {
                stopwatchId: stopwatchId,
                elapsedTimeCount: (paused ? (lastPausedTime! - startTime - pausedTimeCount) : (now - startTime - pausedTimeCount)), // WET with elapsedTimeMillis,
                startTime: startTime,
                endTime: now,
                pausedTimeCount: pausedTimeCount,
            })
            
        })

        currentTime = Date.now();
    }

    function deleteButtonPressed(){
        const confirmDelete = confirm(`Delete "${title}?"`)
        if (!confirmDelete) 
            return
        
        store.transaction(() => {
            store.delRow('stopwatches', stopwatchId)
        })
        // const historyIsClear = false
        // if (!historyIsClear) {
        //     const doClear = confirm("Would you like to clear the history of this stopwatch?")
        //     if (doClear){

        //         return
        //     }
        // }
        

        // const doDelete = confirm("Would you like to delete this stopwatch?")
    }



    let elapsedTimeUnits = $derived(msToUnits(elapsedTimeMillis))
    let timeDisplay = $derived(unitsToDisplayString(elapsedTimeUnits))
    


</script>

<div class="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit relative">
    <h1 class="text-xl text-[1.unitsToDisplayStringnter  decoration-1 font-semibold">
        <div contenteditable="true" bind:innerText={title}>{title} </div>
    </h1>
    <button 
        class="bg-red-600 border-2  text-white   border-black dark:border-neutral-300 rounded-sm  hover:brightness-125 py-0 px-1 font-mono rounded-sm text-sm absolute right-2 top-2"
        onclick={deleteButtonPressed}
    >
        X
    </button>
    
    <div class="pt-3"></div>
    
    <p class = "time">
        <!-- {secondsString} -->
        
        {#if (elapsedTimeUnits.days > 0)}{timeDisplay.days}:{/if}{timeDisplay.hours}:{timeDisplay.minutes}:{timeDisplay.seconds}<span class="text-base">. </span><span class="text-xs">{timeDisplay.milliseconds}</span>
    </p>

    <div class="pt-3"></div>

    <div class="flex gap-3 items-center justify-evenly flex-wrap" >
        {#if paused}
            {#if elapsedTimeMillis > 0}
                <button class="control-button bg-lime-700" onclick={unpause}>
                    Resume
                </button>
            {:else}
                <button class="control-button bg-lime-700" onclick={unpause}>
                    Start
                </button>
            {/if}
        {:else }
            <button class="control-button bg-lime-600" onclick={pause}>Pause</button>
        {/if}

        <button class="control-button bg-red-600"  onclick={reset}>
            Reset
        </button>
    </div>

    <div class="pt-3"></div>

    <!-- Extract -->
    <StopwatchHistoryDisplay stopwatchId={stopwatchId}/>
</div>

<style lang="postcss">
    .time {
        width: fit-content;
        margin:auto; 
        /* background: #64748b; */

        @apply border-2 border-black dark:border-neutral-300 rounded-md text-5xl px-4 py-1 pb-1.5;
        @apply bg-stone-300 dark:bg-stone-600
    }
    .control-button {
        /* border: 2px solid black; */


        @apply border-2 border-black dark:border-neutral-300 rounded-md text-white  min-w-24 px-1 py-1 pb-1.5
    }
</style>