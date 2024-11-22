
export function assertDefined<T>(value: T | undefined, name?: string): T {
    if (value === undefined || value === null) 
        throw new Error((name ?? "a value") + " is undefined"); 
    return value;
}

export function assumeDefined<T>(value: T | undefined, name?: string): T {
    if (value === undefined || value === null)
        console.error((name ?? "a value") + " is unexpectedly undefined");
    
    return value as T
}


// TImer
export function msToUnits(ms: number) {
    return {
        milliseconds: Math.floor(ms % 1000),
        seconds: Math.floor((ms / 1000) % 60),
        minutes: Math.floor((ms / (1000 * 60)) % 60),
        hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    };
}
export function unitsToDisplayStrings(elapsedTimeUnits: ReturnType<typeof msToUnits>) {
    return {
        milliseconds: elapsedTimeUnits.milliseconds.toString().padStart(3, "0"),
        seconds: elapsedTimeUnits.seconds.toString().padStart(2, "0"),
        minutes: elapsedTimeUnits.minutes.toString().padStart(2, "0"),
        hours: elapsedTimeUnits.hours.toString().padStart(2, "0"),
        days: elapsedTimeUnits.days.toString().padStart(2, "0"),
    };
}



