
import { ColorGroup as ColorGroup, GROUPS, GROUPS_TO_TEXT_COLORS } from './colorStuff';
import { store, UiReactWithSchemas } from './tinybase-store';
import { assumeDefined, msToUnits, unitsToDisplayStrings } from './utils';


const {useCell, useRow } = UiReactWithSchemas;



type HistoryRow = ReturnType<typeof useRow<'stopwatchHistory'>>

export default function StopwatchHistoryStatistics(props: { stopwatchHistoryRowIds: string[] }) {
    const rows = props.stopwatchHistoryRowIds.map((stopwatchHistoryRowId) => {
        return assumeDefined(store.getRow('stopwatchHistory', stopwatchHistoryRowId))
    })

    const {groups, rowsByGroup} = rows.reduce((acc, row) => {
        const group = row.group
        if (!acc.rowsByGroup[group]) {
            acc.rowsByGroup[group] = []
            acc.groups.push(group)
        }
        
        acc.rowsByGroup[group].push(row)
        return acc
    }, {groups: [], rowsByGroup: {}} as {groups: string[],rowsByGroup: {[group: string]: HistoryRow[]}})


    return (
        <div>
            {GROUPS.map( (group) => (
                    <div key={group} className={assumeDefined( GROUPS_TO_TEXT_COLORS[group as ColorGroup] )}>
                        {(groups.includes(group)) ? (
                            <HistoryStatistics stopwatchHistoryRows={rowsByGroup[group]} />
                        ) : (
                            <></>
                        )}
                    </div>
            ))}
            {(groups.length >= 2) && (
                <div className='text-sm font-semibold' >
                    {/* style={{WebkitTextStroke: '0.5px white'}} */}
                    <HistoryStatistics stopwatchHistoryRows={rows} totalMode/>
                </div>
            )}
            

        </div>
    )
}

function HistoryStatistics(props: {stopwatchHistoryRows: HistoryRow[], totalMode?: boolean}) {
    
    const elapsedTimeCounts = props.stopwatchHistoryRows.map((row) => assumeDefined(row.elapsedTimeCount))
    const {sum, avg} = getStatistics({elapsedTimeCounts})


    

    function getDisplayString(ms: number) {
        const strings = unitsToDisplayStrings(msToUnits(ms))
        if (strings.days === '00') {
            return {
                main: `${strings.hours}:${strings.minutes}:${strings.seconds}`, 
                ms: strings.milliseconds
            }
        }
    
        return {
            main: `${strings.days}:${strings.hours}:${strings.minutes}:${strings.seconds}`, 
            ms: strings.milliseconds
        }
    }
    
    const statsToDisplay = props.totalMode ? [["Total Time", sum]] : [["Average Time", avg], ["Total Time", sum]] as const
    
    return (
        <>
            {statsToDisplay.map(([stat, time]) => (
                <div className="flex gap-1 justify-between items-center text-base" key={stat}>
                    <p>{stat}:</p>
                    <p className="flex justify-center items-center">
                        <span>
                            {getDisplayString(time).main}
                            <span className="text-[.5rem]">.{getDisplayString(time).ms}</span>
                        </span>
                    </p>
                </div>
            ))}
        </>
    );
}

function getStatistics(props: { elapsedTimeCounts: number[] }) {
    
    const sum = props.elapsedTimeCounts.reduce((a, b) => a + b, 0)
    const avg = sum / props.elapsedTimeCounts.length


    return {sum, avg}
}