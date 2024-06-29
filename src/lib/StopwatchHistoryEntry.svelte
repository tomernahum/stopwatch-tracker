<script lang="ts">
	import { msToDisplayString, msToUnits, unitsToDisplayString } from "./stopwatch";
	import store from "./tinybase";

    let {
        stopwatchHistoryRowId
    }: {
        stopwatchHistoryRowId: string,
    } = $props()


    let entryData = $state(store.getRow('stopwatchHistory', stopwatchHistoryRowId)!)
    $effect(() => {
        const listenerId = store.addRowListener(
            'stopwatchHistory',
            stopwatchHistoryRowId,
            (store, tableId, rowId, getCellChange) => {

                entryData = store.getRow("stopwatchHistory", stopwatchHistoryRowId)
            },
        );

        return () => {
            store.delListener(listenerId)
        }
    })

    const elapsedTimeCount = $derived(msToUnits(entryData.elapsedTimeCount!))
    const elapsedTimeCountDisplay = $derived(unitsToDisplayString(elapsedTimeCount))

    function deleteEntry() {

    }
    

</script>

<div class=" flex gap-1 items-stretch justify-normal  text-white">
    <div class="flex justify-center items-stretch">
        <button 
            class="bg-red-500  hover:bg-red-600 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" 
            onclick={deleteEntry}
        >
            X
        </button>
        <!-- TODO: confirm by turning into 2 buttons to confirm and cancel -->
    </div>
    <div class="text-base bg-zinc-600 p-0.5 rounded-sm text-center min-w-32 flex justify-center items-center">
        {#if (elapsedTimeCount.days > 0)}{elapsedTimeCountDisplay.days}:{/if}{elapsedTimeCountDisplay.hours}:{elapsedTimeCountDisplay.minutes}:{elapsedTimeCountDisplay.seconds}
        <!-- <span class="text-base">. </span><span class="text-xs">{elapsedTimeCountDisplay.milliseconds}</span> -->
    </div>
    <div 
        class="flex gap-1 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1.5 py-0.5"
    >
        <!-- Date -->
        <p class="opacity-75">
            {new Date(entryData.endTime!).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
        </p>

        <p class="opacity-65">|</p>
        
        <!-- Time -->
        <p class="opacity-55">
            16:42
        </p>
    </div>
</div>