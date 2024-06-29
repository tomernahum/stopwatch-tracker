<script lang="ts">
	import TimerPersisted from "$lib/Stopwatch.svelte";
	import createStopwatch from "$lib/createStopwatch";
	import store from "$lib/tinybase";

    //TODO: maintain a specific order of stopwatches
    let stopwatchIds = $state(store.getRowIds('stopwatches'))

    $effect(() => {
        const listener = store.addRowIdsListener('stopwatches', (store, tableId) => {
            stopwatchIds = store.getRowIds(tableId)
        })

        return ()=>{
            store.delListener(listener)
        }
    })

    function newStopwatch() {
        const id = createStopwatch()
    }
    
</script>

<main class="px-3 py-3">
    <div class="flex flex-wrap justify-center gap-10">

        {#each stopwatchIds as id (id)}
            <TimerPersisted stopwatchId={id} />
        {/each}

        <!-- Create Stopwatch Button -->
        <button
            onclick={newStopwatch}
            class="min-w-64 min-h-96 border-2 rounded-md"
        >
            +
        </button>
    </div>
    
</main>

