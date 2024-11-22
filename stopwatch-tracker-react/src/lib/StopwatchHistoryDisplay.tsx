import { useState } from 'react';
import { store, UiReactWithSchemas } from './tinybase-store';
import { assumeDefined, msToUnits, unitsToDisplayStrings } from './utils';
import { ColorGroup, GROUPS, GROUPS_TO_COLORS } from './colorStuff';
import HistoryStatistics from './StopwatchHistoryStatistics';
import ErrorBoundary from './ErrorBoundary';
const {useSliceRowIds, useCell } = UiReactWithSchemas;

export default function StopwatchHistoryDisplay(props: { stopwatchId: string }) {
	const stopwatchHistoryRowIds = useSliceRowIds('byStopwatchId', props.stopwatchId).toReversed();

    // const stopwatchHistoryRowIds = useRowIds('stopwatchHistory') //TODO wrong


	return (
		<div className="relative">
			<p className="text-center text-base">Previous Times:</p>
			<div className="pt-1.5"></div>


			<div className="flex flex-col gap-1.5 ">
                {/* max-h-52 overflow-y-auto  */}
				{stopwatchHistoryRowIds.map((stopwatchHistoryRowId) => (
					<StopwatchHistoryEntry
						key={stopwatchHistoryRowId}
						stopwatchHistoryRowId={stopwatchHistoryRowId}
					/>
				))}
			</div>

			<div className="pt-3"></div>
            <ErrorBoundary>
			    <HistoryStatistics stopwatchHistoryRowIds={stopwatchHistoryRowIds} />
            </ErrorBoundary>
		</div>
	);
}

/* 
    TODO: if it's >2/day, do pagination per day. this should affect statistics as well 

    also need an "all time view" at least for statistics

    can also do overflow button if entry rows per one screen is too much. Or just scroll locally
    
*/

function StopwatchHistoryEntry(props: { stopwatchHistoryRowId: string }) {
	
    const group = assumeDefined(useCell('stopwatchHistory', props.stopwatchHistoryRowId, 'group'))
    const elapsedTimeCount = assumeDefined(useCell('stopwatchHistory', props.stopwatchHistoryRowId, 'elapsedTimeCount'))
    const endTime = assumeDefined(useCell('stopwatchHistory', props.stopwatchHistoryRowId, 'endTime'))

    function deleteEntry() {
        store.delRow('stopwatchHistory', props.stopwatchHistoryRowId)
    }
    
    return (
		<div className="flex items-stretch justify-normal gap-1 text-white">
			<div className="flex items-stretch justify-center">
				<ConfirmXButton onClick={deleteEntry} />
			</div>

            <ColorPicker selectedOption={group} onSelected={(selected) => {
                store.setCell('stopwatchHistory', props.stopwatchHistoryRowId, 'group', selected)
            }} />
            

            <div  className="text-base bg-zinc-600 p-0.5 rounded-sm text-center flex justify-center items-center grow">
                <ElapsedTimeDisplay elapsedTimeMillis={elapsedTimeCount} />
            </div>
            
            <div className="flex gap-1 ml-auto text-xs items-center bg-zinc-700 rounded-sm px-1.5 py-0.5 w-fit ">
                <DateTimeDisplay timestamp={endTime} />
            </div>
		</div>
	);
}

function ElapsedTimeDisplay(props: { elapsedTimeMillis: number }) {
    let elapsedTimeMillis = props.elapsedTimeMillis;
    let elapsedTimeUnits = msToUnits(elapsedTimeMillis);
    let timeDisplay = unitsToDisplayStrings(elapsedTimeUnits);

    function Colon(props: { className?: string } = { className: "" }) {
        return (
            <span className={`${props.className} font-['Inter_Variable']`}>:</span>
        );
    }

    return (
        // todo tidy/change classNames
        <>
            {elapsedTimeUnits.days > 0 && (
                <span>
                    {timeDisplay.days}
                    <Colon />
                </span>
            )}
            {timeDisplay.hours}
            <Colon />
            {timeDisplay.minutes}
            <Colon />
            {timeDisplay.seconds}
        </>
    );
}
function DateTimeDisplay(props: {timestamp: number}) {

    return (
        <>
            {/* <!-- Date --> */}
            <p className="opacity-75">
                {new Date(props.timestamp).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
            </p>

            <p className="opacity-65">|</p>
            
            {/* <!-- Time --> */}
            <p className="opacity-55">
                {new Date(props.timestamp).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit'})}
            </p>
        </>
    )
}




function ConfirmXButton(props: { onClick: () => void }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			{!open ? (
				<button
					className="rounded-sm bg-red-500 px-0.5 py-0.5 font-mono text-sm text-white hover:bg-red-600"
					onClick={() => setOpen(true)}
				>
					X
				</button>
			) : (
				<div className="flex gap-0.5">
					<button
						className="rounded-sm bg-zinc-500 px-0.5 py-0.5 font-mono text-sm text-white hover:bg-zinc-600"
						onClick={() => {
                            setOpen(false);
						}}
					>
						←
					</button>

					<button
						className="rounded-sm bg-red-500 px-0.5 py-0.5 font-mono text-sm text-white hover:bg-red-600"
						onClick={() => {
							setOpen(false);
                            props.onClick();
						}}
					>
						X
					</button>
				</div>
			)}
		</>
	);
}


// TODO: color picker is clipped by overflow-x

function ColorPicker(props: {
	selectedOption: string;
	onSelected: (selected: string) => void;
}) {

	if (!GROUPS.includes(props.selectedOption as ColorGroup)) {
		console.error("selectedOption is not a valid group");
		props.selectedOption = 'default'
	}


	const [dropdownOpen, setOpen] = useState(false);

    // todo maybe: only one open at a time per stopwatch or globally
    

    const selectedStyle = GROUPS_TO_COLORS[props.selectedOption as ColorGroup]

	return (
		<div className=" relative flex items-stretch">
			<div className="flex items-stretch">
				<button
					className={`${selectedStyle} z-0 flex w-6 items-center rounded-sm`}
					onClick={() => setOpen((o) => !o)}
				>
					<span className="ml-auto flex h-full w-[.5rem] items-center justify-center rounded-r-sm bg-neutral-300 text-[0.6rem] text-neutral-500 hover:brightness-[80%]">
						V
					</span>
				</button>
			</div>
			<div
				className={`absolute top-0 left-0 z-50 mt-7 origin-top-right rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownOpen ? 'block' : 'hidden'}`}
			>
				<div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
					{GROUPS.map(groupName => (
						<button
                            key={groupName}
							className={`${GROUPS_TO_COLORS[groupName]} block h-6 w-6 cursor-pointer text-sm text-gray-700 hover:text-gray-900 hover:brightness-150`}
							onClick={() => {
								// selected = [groupName, className];
								setOpen(false);
								props.onSelected(groupName);
							}}
						></button>
					))}
				</div>
			</div>
		</div>
	);
}