<script lang="ts">
    let {
        stopwatchHistoryRowIds
    }: {
        stopwatchHistoryRowIds: string[]
    } = $props()


    
</script>


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