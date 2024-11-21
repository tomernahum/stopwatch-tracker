import { useState } from 'react';
import { assumeDefined } from './utils';

const GROUPS_AND_STYLES = [
	['default', 'bg-white'],
	['green', 'bg-green-500'],
	['blue', 'bg-blue-500'],
	['sky', 'bg-sky-500'],
	['purple', 'bg-purple-500'],
	['pink', 'bg-pink-500'],
	['red', 'bg-red-500'],
	['orange', 'bg-orange-500'],
	['yellow', 'bg-yellow-500']
];

export function ColorPicker(props: {
	selectedOption: string;
	onSelected: (selected: string) => void;
}) {
	const [dropdownOpen, setOpen] = useState(false);

    const selectedStyle = assumeDefined(GROUPS_AND_STYLES.find(([groupName]) => groupName === props.selectedOption)[1], "selectedStyle")

	return (
		<div className="relative flex items-stretch">
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
				className={`absolute left-0 top-0 z-50 mt-7 origin-top-right rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownOpen ? 'block' : 'hidden'}`}
			>
				<div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
					{GROUPS_AND_STYLES.map(([groupName, className]) => (
						<button
                            key={groupName}
							className={`${className} block h-6 w-6 cursor-pointer text-sm text-gray-700 hover:text-gray-900 hover:brightness-150`}
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
