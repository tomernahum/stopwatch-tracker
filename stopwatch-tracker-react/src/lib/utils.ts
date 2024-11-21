
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


// In the future you may be able to call this with pipe operator |> to make it look better.


const a: string | undefined = "a"
const y = assertDefined(a);

console.log(y)