
<script>
	import store from "./tinybase";

    let showShareModal = false;
    let roomName = '';

    function shareUrl() {
        // Logic for sharing functionality
        // alert(`Sharing room: ${roomName}`);
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomName);
        
        navigator.clipboard.writeText(url.toString());
        alert(`Copied room URL to clipboard: ${url}`);
        
        //get the store for that url, merge local store into it
        // could redirect to &newMerge=true
        
        showShareModal = false;
    }
</script>

<button
    class="border-2 bg-neutral-400 dark:bg-[hsl(0,0%,12%)] border-black dark:border-gray-500  py-1 px-3 rounded-md relative" style="z-index: 10000;"
    onclick={() => {
        roomName = Math.random().toString(36).substring(2, 16);
        showShareModal = true;
    }}
>
    Share (exp)
</button>

{#if showShareModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style="z-index: 10001;">
        <div class="bg-white dark:bg-[hsl(0,0%,12%)] p-4 rounded-md">
            <h2 class="text-lg font-bold mb-2">Share Room (experimental)</h2>
            
            <p class="text-lg mb-1">Enter a unique Id for the shared room. </p>
            <p>Anyone with the ID can edit. </p>
            <p class="mb-4">If the room already exists your data will be merged into it</p>
            
            <input type="text" bind:value={roomName} class="border-2 border-black dark:border-gray-500 p-2 rounded-md w-full" />
            <div class="flex justify-end mt-4">
                <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md" onclick={() => showShareModal = false}>
                    Cancel
                </button>
                <button class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md ml-2" onclick={shareUrl}>
                    Share
                </button>
            </div>
        </div>
    </div>
{/if}
