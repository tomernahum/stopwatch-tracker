<script lang="ts">
	import StopwatchHistoryEntry from "./HistoryEntry.svelte";
import { indexes } from "../tinybase";
	import HistoryStatistics from "./HistoryStatistics.svelte";

    let {
        stopwatchId
        // refreshRate=9
    }: {
        stopwatchId: string,
        // refreshRate?: number  
    } = $props()


    // TODO: max number of entries / pagination
    let stopwatchHistoryRowIds = $state(indexes.getSliceRowIds('byStopwatchId', stopwatchId).toReversed())
    $effect(()=>{
        const listenerId =  indexes.addSliceRowIdsListener('byStopwatchId', stopwatchId, () => {
            // console.log("NEW ROW on:", stopwatchId, indexes.getSliceRowIds('byStopwatchId', stopwatchId))
            stopwatchHistoryRowIds = indexes.getSliceRowIds('byStopwatchId', stopwatchId).toReversed()
        });
        return () => {
            indexes.delListener(listenerId)
        }
    })




</script>

<div>
    <p class="text-base text-center">Previous Times:</p>
    <div class="pt-1.5"></div>
    <div class="flex flex-col gap-1.5">
        {#each stopwatchHistoryRowIds as id (id)}
            <div>
                <!-- weird bug appears only in build mode (not dev mode) if i remove the div - todo: investigate -->
                <StopwatchHistoryEntry stopwatchHistoryRowId={id} />
            </div>
        {/each}
    </div>

    <div class="pt-3"></div>
    <HistoryStatistics stopwatchHistoryRowIds={stopwatchHistoryRowIds}/>
    
</div>