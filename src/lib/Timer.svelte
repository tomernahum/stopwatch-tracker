<script lang="ts">
    import store from "$lib/store"
    //timer

    type Milliseconds = number 

    let {
        startTime: startTime, 
        refreshRate = 9,
        paused = false
    }: {
        startTime: Milliseconds, 
        refreshRate?: Milliseconds
        paused?: boolean
    } = $props() // annoying that you are forced to write every prop twice to type it in svelte 5.

    






    let currentTime = $state(Date.now());
    let lastPausedTime = $state(null as null | Milliseconds)
    let pausedTimeCount = $state(0)

    
    let elapsedTimeMillis = $derived(paused ? lastPausedTime! - startTime - pausedTimeCount : currentTime - startTime - pausedTimeCount)


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
        lastPausedTime = now
        paused = true
    }

    function unpause() {
        const now = Date.now()
        if (!lastPausedTime)
            throw new Error('Timer is not paused')

        pausedTimeCount += (now - lastPausedTime)
        paused = false
        lastPausedTime = null
        
        currentTime = Date.now();
        
    }

    function reset(){
        const now = Date.now()


        startTime = now
        pausedTimeCount = 0

        if (paused) {
            lastPausedTime = now
        }
        else {
            lastPausedTime = null
        }

        // auto pause after reset, still considering whether to have this
        lastPausedTime = now
        paused = true

        console.log({elapsedTimeMillis, lastPausedTime,  startTime, pausedTimeCount})

        currentTime = Date.now();
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

<div class="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit">
    <h1 class="text-xl text-[1.5rem] text-center  decoration-1 font-semibold">
        Stopwatch 1
    </h1>
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
            {#each [1,2] as _}
            <div class=" flex gap-1 items-stretch justify-normal  text-white">
                <div class="flex justify-center items-stretch">
                    <button class="bg-red-500  hover:bg-blue-700 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" >
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
        </div>

        <div class="pt-3"></div>
        <details open>
            <summary>
                Statistics
            </summary>
            <div>
                {#each [["Total Time", "11:03:06"], ["Average Time", "5:31:33"]] as [title, time]}
                    <div class="flex gap-1 justify-between items-center  text-white text-base">
                        <p>{title}:</p> 
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