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
    let stopwatchHistoryRowIds = $state(indexes.getSliceRowIds('byStopwatchId', stopwatchId))
    $effect(()=>{
        const listenerId =  indexes.addSliceRowIdsListener('byStopwatchId', stopwatchId, () => {
            // console.log("NEW ROW on:", stopwatchId, indexes.getSliceRowIds('byStopwatchId', stopwatchId))
            stopwatchHistoryRowIds = indexes.getSliceRowIds('byStopwatchId', stopwatchId)
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
        {#each stopwatchHistoryRowIds.toReversed() as id (id)}
            <StopwatchHistoryEntry stopwatchHistoryRowId={id} />
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
    <HistoryStatistics stopwatchHistoryRowIds={stopwatchHistoryRowIds}/>
    
</div>