<script lang="ts">
	import Timer from "$lib/TimerOld.svelte";
	import TimerPersisted from "$lib/StopwatchPersisted.svelte";
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
            <TimerPersisted id={id} />
        {/each}

        <button
            onclick={newStopwatch}
        >
            +
        </button>
    </div>
    
</main>

