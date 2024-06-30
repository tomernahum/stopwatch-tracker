<script>
    let { 
        onClick
    } = $props();

    // TODO: can accept tailwind styles as prop and therefore allow this component to be reused in other places


    let open = $state(false)
</script>





{#if !open}
    <button 
        class="bg-red-500 hover:bg-red-600 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" 
        onclick={() => open = true}
    >
        X
    </button>

{:else}

    <div class="flex gap-0.5">
        <button 
            class="bg-zinc-500 hover:bg-zinc-600 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" 
            onclick={() => {
                open = false
            }}
        >
            ←
        </button>

        <button 
            class="bg-red-500 hover:bg-red-600 text-white  py-0.5 px-0.5 font-mono rounded-sm text-sm" 
            onclick={() => {
                open = false
                onClick()
            }}
        >
            X
        </button>
    </div>

    


{/if}