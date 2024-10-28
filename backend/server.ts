
import {WebSocketServer} from 'ws';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';

import {createFilePersister} from 'tinybase/persisters/persister-file';
import { createMergeableStore } from 'tinybase';

const persistingServer = createWsServer(
    new WebSocketServer({port: 8050}),
    (pathId) =>
        createFilePersister(
        createMergeableStore(),
        'room_data/' + pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);


// TODO: r8 l1mting / avail@bilty-att@cks pr0tect10n (idk if they are scanning source code for targets lol), + maybe user accounts with authorization on what rooms they can access
// TODO: deploy. if we deploy to railway it might need to write to files at a mount path

// persistingServer.destroy();