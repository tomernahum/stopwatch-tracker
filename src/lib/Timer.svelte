<script lang="ts">
    //timer

    type Milliseconds = number 

    let {
        startTime: startTime, 
        refreshRate = 1,
        paused = false
    }: {
        startTime: Milliseconds, 
        refreshRate?: Milliseconds
        paused?: boolean
    } = $props() // annoying that you are forced to write every prop twice to type it.


    let currentTime = $state(Date.now());

    let pausedTimeCount = $state(0)

    let elapsedTimeMillis = $derived(currentTime - startTime - pausedTimeCount)
    let secondsDisplay = $derived((elapsedTimeMillis / 1000).toFixed(3))
    
    $effect(() => {
        const interval = setInterval(() => {
            currentTime = Date.now();
        }, refreshRate)

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			clearInterval(interval);
		};
	});

    function pause() {
        paused = true
    }

    function unpause() {
        paused = false
    }

    

</script>

<div class="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500 rounded-md px-3 py-3 max-w-fit">
    <h1 class="text-lg text-center  decoration-1">
        Stopwatch 1
    </h1>
    <div class="pt-3"></div>
    
    <p class = "time">
        {secondsDisplay}
    </p>

    <div class="pt-3"></div>

    <div class="flex gap-3 items-center justify-evenly flex-wrap" >
        {#if paused}
            <button class="control-button bg-green-600" onclick={unpause}>Resume</button>
        {:else }
            <button class="control-button bg-lime-600" onclick={pause}>Pause</button>
        {/if}

        <button class="control-button bg-red-600" >Reset</button>
    </div>

    <div class="pt-4"></div>
    <div>
        <p class="text-xs text-center">Previous Times:</p>
        <div class="pt-1"></div>
        <div class=" flex gap-1 items-stretch justify-normal ">
            <div class="flex justify-center items-stretch">
                <button class="bg-red-500  hover:bg-blue-700 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" >
                    X
                </button>
            </div>
            <div class="text-base bg-zinc-600 p-0.5 rounded-sm text-center min-w-32 flex justify-center items-center">
                5:31:33
            </div>
            <!-- <div class="mr-auto"></div> -->
            <!-- <div 
                class="flex gap-0 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1 py-0.5 flex-col"
            > -->
            <div 
                class="flex gap-1 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1 py-0.5"
            >
                <p class="opacity-75">10/31/24</p>
                <p class="opacity-55">16:42</p>
            </div>

            
        </div>
    </div>
</div>

<style lang="postcss">
    .time {
        width: fit-content;
        margin:auto; 
        /* background: #64748b; */

        @apply border-2 border-black dark:border-neutral-300 rounded-md text-xl px-4 py-1 pb-1.5;
        @apply bg-stone-300 dark:bg-stone-600
    }
    .control-button {
        /* border: 2px solid black; */


        @apply border-2 border-black dark:border-neutral-300 rounded-md text-white  min-w-24 px-1 py-1 pb-1.5
    }
</style>