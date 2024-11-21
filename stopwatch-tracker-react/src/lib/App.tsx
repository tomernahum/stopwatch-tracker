import { useState } from 'react'

import {store, indexes, UiReactWithSchemas} from './tinybase-store'
import { Inspector } from 'tinybase/ui-react-inspector'
import { Stopwatch } from './Stopwatch'
import MainScreen from './MainScreen'

const { Provider, useRowIds } = UiReactWithSchemas

export default function App() {
  return (
    <>
      <Provider 
        store={store}
        indexes={indexes}
      >

        <MainScreen />

        <Inspector open={true} />
      </Provider>

    </>
  )
}

