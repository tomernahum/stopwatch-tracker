import { useState } from 'react';
import { assumeDefined } from './utils';


export const GROUPS = ['default', 'green', 'blue', 'sky', 'purple', 'pink', 'red', 'orange', 'yellow'] as const

export type ColorGroup = typeof GROUPS[number]


export const GROUPS_TO_COLORS= {
	'default': 'bg-gray-200',
	'green': 'bg-green-500',
	'blue': 'bg-blue-500',
	'sky': 'bg-sky-400',
	'purple': 'bg-purple-500',
	'pink': 'bg-pink-400',
	'red': 'bg-red-500',
	'orange': 'bg-orange-500',
	'yellow': 'bg-yellow-500'
}

export const GROUPS_TO_TEXT_COLORS= {
	'default': 'text-white dark:text-gray-200',
	'green': 'text-green-700 dark:text-green-500',
	'blue': 'text-blue-600 dark:text-blue-500',
	'sky': 'text-sky-300 dark:text-sky-400',
	'purple': ' text-purple-600 dark:text-purple-500',
	'pink': 'text-pink-300 dark:text-pink-400',
	'red': 'text-red-600 dark:text-red-500',
	'orange': 'text-orange-600 dark:text-orange-500',
	'yellow': 'text-yellow-400 dark:text-yellow-500'
}


// used by StopwatchHistoryDisplay


