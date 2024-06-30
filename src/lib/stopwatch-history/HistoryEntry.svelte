<script lang="ts">
	import { msToDisplayString, msToUnits, unitsToDisplayString } from "../stopwatch";
	import ConfirmXButton from "./XButtonWithConfirm.svelte";
	import store from "../tinybase";

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
        store.delRow('stopwatchHistory', stopwatchHistoryRowId)
    }
    

</script>

<div class=" flex gap-1 items-stretch justify-normal  text-white">
    <div class="flex justify-center items-stretch">
        <ConfirmXButton onClick={deleteEntry} />
    </div>
    <div 
        class="text-base bg-zinc-600 p-0.5 rounded-sm text-center flex justify-center items-center grow"
    >
        {#if (elapsedTimeCount.days > 0)}{elapsedTimeCountDisplay.days}:{/if}{elapsedTimeCountDisplay.hours}:{elapsedTimeCountDisplay.minutes}:{elapsedTimeCountDisplay.seconds}
        <!-- <span class="text-base">. </span><span class="text-xs">{elapsedTimeCountDisplay.milliseconds}</span> -->
    </div>
    <div 
        class="flex gap-1 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1.5 py-0.5 w-fit "
    >
        <!-- Date -->
        <p class="opacity-75">
            {new Date(entryData.endTime!).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
        </p>

        <p class="opacity-65">|</p>
        
        <!-- Time -->
        <p class="opacity-55">
            {new Date(entryData.endTime!).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit'})}
        </p>
    </div>
</div>