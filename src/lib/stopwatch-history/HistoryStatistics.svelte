
<script lang="ts">
	import { msToDisplayStrings } from "$lib/stopwatch";
	import store from "$lib/tinybase";
	import type { Row } from "tinybase/with-schemas/store";

    let {
        stopwatchHistoryRowIds: rowIds
    }: {
        stopwatchHistoryRowIds: string[]
    } = $props()


    const x = store.getRow('stopwatchHistory', rowIds[0])

    let rows = $state({} as Record<string, typeof x>);

    // currently the row ids don't really change that much so listener isn't called
    $effect(() => {
        const listeners = rowIds.map(id => {
            const listenerId = store.addRowListener('stopwatchHistory', 
                id, (store, tableId, rowId, getCellChange) => {
                    console.log("row changed", rowId, store.getRow('stopwatchHistory', id))
                    rows[id] = store.getRow('stopwatchHistory', id)
                }
            )
            rows[id] = store.getRow('stopwatchHistory', id)
            return listenerId
        })

        return () => {
            listeners.forEach(id => store.delListener(id))
        }
    })

    let total = $derived(rowIds.reduce((acc, id) => {
        const row = rows[id]

        if (!row) {
            console.warn("row not found", id, row)
            return acc
        }

        return acc + row.elapsedTimeCount!
    }, 0))

    let average = $derived(total / rowIds.length)

    //TODO: daily average

    let statsToDisplay = $derived([["Average Time", average], ["Total Time", total]] as const)
    

    function getDisplayString(ms: number) {
        const strings = msToDisplayStrings(ms)

        

        if (strings.days === '00') {
            return [`${strings.hours}:${strings.minutes}:${strings.seconds}`, strings.milliseconds]
        }
        return [`${strings.days}:${strings.hours}:${strings.minutes}:${strings.seconds}`, strings.milliseconds]
    }
</script>


<details open>
    <summary>
        Statistics
    </summary>
    <div>
        {#each statsToDisplay as [stat, time]}
            <div class="flex gap-1 justify-between items-center text-base">
                <p>{stat}:</p> 
                <p class="flex justify-center items-center">
                    {#if time}
                        <span>
                        {getDisplayString(time)[0]}<span class="text-[.5rem]">.{getDisplayString(time)[1]}</span>
                        <!-- TODO: maybe extract this and other places used into a component (pass in tailwind for ms) -->
                        <!-- TODO: make prettier, maybe make seconds smaller-->
                        </span>
                    {:else}
                        <span class="text-sm h-fit">N/A</span>
                    {/if}
                </p>
            </div>
        {/each}
    </div>
</details>