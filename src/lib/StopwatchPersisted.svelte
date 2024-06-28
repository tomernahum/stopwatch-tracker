<!-- Please client render pages with this component -->
<script lang="ts">
	import { browser, building, dev } from "$app/environment";
    import store from "$lib/tinybase"
	import { onMount } from "svelte";

    type Milliseconds = number 

    let {
        id: timerId,
        refreshRate=9
    }: {
        id: string,
        refreshRate?: Milliseconds  
    } = $props() // annoying that you are forced to write every prop twice to type it in svelte 5.


    if (!browser && !building) {
        throw new Error("this component can only be rendered in the browser")
    }
    
    //--------DB Data----------
    let startTime = $state(store.getCell('stopwatches', timerId, "startTime"))
    let paused = $state(store.getCell('stopwatches', timerId, "paused"))
    let title = $state(store.getCell('stopwatches', timerId, "title"))
    let lastPausedTime = $state(store.getCell('stopwatches', timerId, "lastPausedTime"))
    let pausedTime = $state(store.getCell('stopwatches', timerId, "pausedTime"))

    if (
        startTime === undefined || paused === undefined || title === undefined || lastPausedTime === undefined || pausedTime === undefined
    ) {
        console.warn({
            startTime, paused, title, lastPausedTime, pausedTime
        })
        throw new Error('something was undefined in timer data')
    }
    

    $effect(() => {
        
        const startTimeListener = store.addCellListener(
            'stopwatches', timerId, 'startTime',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                startTime = newCell
            },
        );
        const pausedListener = store.addCellListener(
            'stopwatches', timerId, 'paused',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                paused = newCell
            },
        );
        const titleListener = store.addCellListener(
            'stopwatches', timerId, 'title',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                title = newCell
            },
        );
        const lastPausedTimeListener = store.addCellListener(
            'stopwatches', timerId, 'lastPausedTime',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                lastPausedTime = newCell
            },
        );
        const pausedTimeListener = store.addCellListener(
            'stopwatches', timerId, 'pausedTime',
            (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
                pausedTime = newCell
            },
        );

        console.log({
            startTime, paused, title, lastPausedTime, pausedTime})

        return () => {
            store.delListener(startTimeListener)
            store.delListener(pausedListener)
            store.delListener(titleListener)
            store.delListener(lastPausedTimeListener)
            store.delListener(pausedTimeListener)
        }

    })
    //binding title to store. not sure if good idea or not
    $effect (() => {
        if (title !== undefined) {
            store.setCell('stopwatches', timerId, 'title', title)
        }
    })
    //------------
    


    let currentTime = $state(Date.now());
    // let lastPausedTime = $state(currentTime as null | Milliseconds)
    // let pausedTimeCount = $state(0)

    
    let elapsedTimeMillis = $derived(paused ? lastPausedTime! - startTime - pausedTime : currentTime - startTime - pausedTime)


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
            store.setCell('stopwatches', timerId, 'lastPausedTime', now)
            store.setCell('stopwatches', timerId, 'paused', true)
        })
    }

    function unpause() {
        const now = Date.now()
        if (lastPausedTime === -1)
            throw new Error('Timer is not paused')


        store.transaction(() => {
            store.setCell('stopwatches', timerId, 'pausedTime', pausedTime + (now - lastPausedTime))

            store.setCell('stopwatches', timerId, 'paused', false)

            store.setCell('stopwatches', timerId, 'lastPausedTime', -1)
        })
        
        currentTime = Date.now();
        
    }

    function reset(){
        const now = Date.now()

        store.transaction(() => {
            store.setCell('stopwatches', timerId, 'startTime', now)
            store.setCell('stopwatches', timerId, 'pausedTime', 0)

            if (paused) {
                store.setCell('stopwatches', timerId, 'lastPausedTime', now)
            }
            else {
                store.setCell('stopwatches', timerId, 'lastPausedTime', -1)
            }

            // auto pause after reset, still considering whether to keep this
            store.setCell('stopwatches', timerId, 'paused', true)
            store.setCell('stopwatches', timerId, 'lastPausedTime', now)
        })

        currentTime = Date.now();
    }

    function deleteButtonPressed(){
        const confirmDelete = confirm(`Delete "${title}?"`)
        if (!confirmDelete) 
            return
        
        store.transaction(() => {
            store.delRow('stopwatches', timerId)
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



    let elapsedTimeUnits = $derived.by(()=>{
        const ms = elapsedTimeMillis
        return {
            milliseconds: Math.floor(ms % 1000),
            seconds: Math.floor((ms / 1000) % 60),
            minutes: Math.floor((ms / (1000  * 60)) % 60),
            hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
            days: Math.floor(ms / (1000 * 60 * 60 * 24)),
        }
    })
    let timeDisplay = $derived.by(() => {
        elapsedTimeUnits
        return {
            milliseconds: elapsedTimeUnits.milliseconds.toString().padStart(3, '0'),
            seconds: elapsedTimeUnits.seconds.toString().padStart(2, '0'),
            minutes: elapsedTimeUnits.minutes.toString().padStart(2, '0'),
            hours: elapsedTimeUnits.hours.toString().padStart(2, '0'),
            days: elapsedTimeUnits.days.toString().padStart(2, '0'),
        }
    })
    


</script>

<div class="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit relative">
    <h1 class="text-xl text-[1.5rem] text-center  decoration-1 font-semibold">
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

        <button class="control-button bg-red-600"  onclick={reset}>Reset</button>
    </div>

    <div class="pt-3"></div>
    <div>
        <p class="text-base text-center">Previous Times:</p>
        <div class="pt-1.5"></div>
        <div class="flex flex-col gap-1.5">
            {#each [1,2, 3, 4] as _}
                <div class=" flex gap-1 items-stretch justify-normal  text-white">
                    <div class="flex justify-center items-stretch">
                        <button class="bg-red-500  hover:bg-red-600 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" >
                            X
                        </button>
                    </div>
                    <div class="text-base bg-zinc-600 p-0.5 rounded-sm text-center min-w-32 flex justify-center items-center">
                        5:31:33
                    </div>
                    <div 
                        class="flex gap-1 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1.5 py-0.5"
                    >
                        <p class="opacity-75">10/31/24</p>
                        <p class="opacity-65">|</p>
                        <p class="opacity-55">16:42</p>
                    </div>
                </div>
            {/each}
            
            <div class=" flex gap-1 items-stretch justify-normal  text-white">
                <button class="text-base bg-zinc-700 opacity-90 hover:brightness-150  p-0.5 rounded-sm text-center w-full flex justify-center items-center">
                    <!-- ... -->
                    v
                </button>  
                
                <!-- <div class="flex justify-center items-stretch">
                    <button class="bg-red-500  hover:bg-blue-700 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" >
                        CL!
                    </button>
                </div> -->
            </div>
        </div>

        <div class="pt-3"></div>
        <details open>
            <summary>
                Statistics
            </summary>
            <div>
                {#each [["Total Time", "11:03:06"], ["Average Time", "5:31:33"]] as [stat, time]}
                    <div class="flex gap-1 justify-between items-center text-base">
                        <p>{stat}:</p> 
                        <p class="">{time}</p>
                    </div>
                {/each}
            </div>
        </details>
        
    </div>
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