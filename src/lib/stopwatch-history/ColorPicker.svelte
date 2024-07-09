<script lang="ts">

    let { 
        options = [
            ["orange", "bg-orange-500"],
            ["yellow", "bg-yellow-500"],
            ["green", "bg-green-500"],
            ["blue", "bg-blue-500"],
            ["indigo", "bg-indigo-500"],
            ["purple", "bg-purple-500"],
            ["pink", "bg-pink-500"],
            ["red", "bg-red-500"],
        ],
        defaultOption = undefined,

        onSelected
    }: {
        options: [string, string][],
        defaultOption?: string,
        onSelected: (option: string) => void
    } = $props();


	let dropdownOpen = $state(false);

    let selected = $state(options.find(option => option[0] === defaultOption) || options[0]);

</script>

<div class="relative flex items-stretch">
	<div class="flex items-stretch">
		<button
			class="flex w-6 items-center rounded-sm z-0 {selected[1]} bg-blu"
			onclick={() => (dropdownOpen = !dropdownOpen)}
		>
			<span
				class="ml-auto flex w-[.5rem] items-center justify-center rounded-r-sm bg-neutral-300 text-[0.6rem] text-neutral-500 hover:brightness-[80%] h-full"
			>
				V
			</span>
		</button>
	</div>
	<div
		class="absolute left-0 top-0 mt-7 origin-top-right rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
		class:block={dropdownOpen}
		class:hidden={!dropdownOpen}
	>
		<div class="" role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
        >
            {#each options as [color, className] (color)}
                <button
                    class="block text-sm text-gray-700 w-6 h-6 hover:brightness-150 hover:text-gray-900  cursor-pointer {className}"
                    

                    onclick={() => {
                        selected = [color, className]
                        dropdownOpen = false
                        onSelected(selected[0])
                    }}
                >
                </button>
            {/each}
		</div>
	</div>
</div>