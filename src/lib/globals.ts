// not in use
import { createTinyBaseStore } from "./tinybase"


const {store, indexes, persister} = createTinyBaseStore()


export const globals = {
    store,
    indexes,
    persister
}

export type Globals = typeof globals