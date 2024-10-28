
import {WebSocketServer} from 'ws';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';

import {createFilePersister} from 'tinybase/persisters/persister-file';
import { createMergeableStore } from 'tinybase';

import crypto from 'crypto';

function hash(...message:any){
    // note this would not be secure for hashing passwords / sensitive data, since it does not on-purpose slow down the hashing algo and maybe other reasons
    console.log(message)
    console.log(JSON.stringify(message))
    return crypto.createHash('sha256').update(JSON.stringify(message)).digest('hex').slice(0, 10);
}

function logMessage(client, ...message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] client ${client}`, ...message);

    // todo can integrate into an analytics tracking solution like umami
};

function createEnchancedWsServer(){
    // TODO: r8 l1mting, maybe auth. currently deployed on fixed size vpsso service att@ck is not end of world (plus clients keep a copy of state as well and work without this backend), will add protections if it happens

    const wss = new WebSocketServer({port: 8050});
    wss.on('connection', (ws, req) => {
        const ip = req.socket.remoteAddress;
        const headers = req.headers;
        const generatedClientId = hash(ip, headers['user-agent']);

        logMessage(generatedClientId, `connected`, {ip, useragent: headers['user-agent'], originHeader: headers.origin, languageHeader: headers['accept-language']});
        
        
        ws.on('message', (message) => {
            
        });
        ws.on('close', () => {
            logMessage(generatedClientId, `disconnected`);
        });
    });
    return wss
}

const persistingServer = createWsServer(
    createEnchancedWsServer(),
    (pathId) =>
        createFilePersister(
        createMergeableStore(),
        'room_data/' + pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);





// persistingServer.destroy();