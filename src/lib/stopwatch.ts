export function msToUnits(ms: number) {
    return {
        milliseconds: Math.floor(ms % 1000),
        seconds: Math.floor((ms / 1000) % 60),
        minutes: Math.floor((ms / (1000  * 60)) % 60),
        hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    }
}

export function unitsToDisplayStrings(elapsedTimeUnits: ReturnType<typeof msToUnits>) {
    return {
        milliseconds: elapsedTimeUnits.milliseconds.toString().padStart(3, '0'),
        seconds: elapsedTimeUnits.seconds.toString().padStart(2, '0'),
        minutes: elapsedTimeUnits.minutes.toString().padStart(2, '0'),
        hours: elapsedTimeUnits.hours.toString().padStart(2, '0'),
        days: elapsedTimeUnits.days.toString().padStart(2, '0'),
    }
}

export function msToDisplayStrings(ms: number) {
    return unitsToDisplayStrings(msToUnits(ms))
}



export function msToDate(ms: number) {
    return 
}