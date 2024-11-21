const {
    createCheckpoints,
    createIndexes,
    createMergeableStore,
    createMetrics,
    createStore,
    getUniqueId,
} = TinyBase;
const { createLocalPersister, createSessionPersister } = TinyBasePersisterBrowser;
const { createWsSynchronizer } = TinyBaseSynchronizerWsClient;
const {
    CellView,
    CheckpointView,
    Provider,
    SliceView,
    useAddRowCallback,
    useCell,
    useCheckpoints,
    useCreateCheckpoints,
    useCreateIndexes,
    useCreateMergeableStore,
    useCreateMetrics,
    useCreatePersister,
    useCreateStore,
    useCreateSynchronizer,
    useMetric,
    useRedoInformation,
    useRow,
    useSetCellCallback,
    useSetCheckpointCallback,
    useSetValueCallback,
    useUndoInformation,
    useValue,
} = TinyBaseUiReact;
const { useCallback, useState } = React;
const { Inspector } = TinyBaseUiReactInspector;

const TYPES = ['Home', 'Work', 'Archived'];
const SCHEMA = {
    todos: {
        text: { type: 'string' },
        done: { type: 'boolean', default: false },
        type: { type: 'string', default: 'Home', allow: TYPES },
    },
};
const INITIAL_TODOS = {
    todos: {
        0: { text: 'Clean the floor', type: 'Home' },
        1: { text: 'Install TinyBase', type: 'Work' },
        2: { text: 'Book holiday', type: 'Archived' },
    },
};

const App = () => {
    const store = useCreateMergeableStore(() =>
        createMergeableStore().setTablesSchema(SCHEMA),
    );
    const checkpoints = useCreateCheckpoints(store, createCheckpoints);
    useCreatePersister(
        store,
        (store) => createLocalPersister(store, 'todos/mergeableStore'),
        [],
        async (persister) => {
            await persister.startAutoLoad([INITIAL_TODOS]);
            checkpoints?.clear();
            await persister.startAutoSave();
        },
        [checkpoints],
    );
    const [serverPathId, createServerPathId] = useServerPathId();
    useCreateSynchronizer(
        store,
        async (store) => {
            if (serverPathId) {
                const synchronizer = await createWsSynchronizer(
                    store,
                    new WebSocket(WS_SERVER + serverPathId),
                );
                await synchronizer.startSync();
                checkpoints?.clear();
                return synchronizer;
            }
        },
        [serverPathId, checkpoints],
    );
    const viewStore = useCreateStore(() =>
        createStore().setValuesSchema({ type: { type: 'string', default: 'Home' } }),
    );
    useCreatePersister(
        viewStore,
        (store) => createSessionPersister(store, 'todos/viewStore'),
        [],
        async (persister) => {
            await persister.startAutoLoad();
            await persister.startAutoSave();
        },
    );
    const indexes = useCreateIndexes(store, (store) =>
        createIndexes(store).setIndexDefinition('types', 'todos', 'type'),
    );
    const metrics = useCreateMetrics(store, (store) => {
        const metrics = createMetrics(store);
        metrics.setMetricDefinition('pending', 'todos', 'sum', (getCell) =>
            !getCell('done') ? 1 : 0,
        );
        TYPES.forEach((type) => {
            metrics.setMetricDefinition(type, 'todos', 'sum', (getCell) =>
                getCell('type') == type && !getCell('done') ? 1 : 0,
            );
        });
        return metrics;
    });

    return (
        <Provider
            store={store}
            storesById={{ viewStore }}
            indexes={indexes}
            metrics={metrics}
            checkpoints={checkpoints}
        >
            <Share
                serverPathId={serverPathId}
                createServerPathId={createServerPathId}
            />
            <NewTodo />
            <Types />
            <Todos />
            <Title />
            <Inspector />
        </Provider>
    );
};

window.addEventListener('load', () =>
    ReactDOM.createRoot(document.body).render(<App />),
);

const Title = () => {
    const pending = useMetric('pending');

    return pending > 0 ? `Todo: ${pending}` : 'All done!';
};

const NewTodo = () => {
    const [text, setText] = useState('');
    const type = useValue('type', 'viewStore');
    const handleChange = useCallback(({ target: { value } }) => setText(value), []);
    const addCheckpoint = useSetCheckpointCallback(
        () => `adding '${text}'`,
        [text],
    );
    const handleKeyDown = useAddRowCallback(
        'todos',
        ({ which, target: { value: text } }) =>
            which == 13 && text != '' ? { text, type } : null,
        [type],
        undefined,
        () => {
            setText('');
            addCheckpoint();
        },
        [setText, addCheckpoint],
    );

    return (
        <input
            id="newTodo"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="New Todo"
            value={text}
        />
    );
};

const Todos = () => (
    <ul id="todos">
        <SliceView
            indexId="types"
            sliceId={useValue('type', 'viewStore')}
            rowComponent={Todo}
        />
    </ul>
);

const Todo = (props) => (
    <li className="todo">
        <TodoText {...props} />
        <TodoType {...props} />
    </li>
);

const TodoText = ({ tableId, rowId }) => {
    const { done, text } = useRow(tableId, rowId);
    const className = 'text' + (done ? ' done' : '');
    const setCell = useSetCellCallback(tableId, rowId, 'done', () => !done, [
        done,
    ]);
    const addCheckpoint = useSetCheckpointCallback(
        () => `${done ? 'resuming' : 'completing'} '${text}'`,
        [done],
    );
    const handleClick = useCallback(() => {
        setCell();
        addCheckpoint();
    }, [setCell, addCheckpoint]);

    return (
        <span className={className} onClick={handleClick}>
            <CellView tableId={tableId} rowId={rowId} cellId="text" />
        </span>
    );
};

const Types = () => (
    <ul id="types">
        {TYPES.map((type) => (
            <Type key={type} type={type} />
        ))}
    </ul>
);

const Type = ({ type }) => {
    const pending = useMetric(type);
    const currentType = useValue('type', 'viewStore');
    const handleClick = useSetValueCallback(
        'type',
        () => type,
        [type],
        'viewStore',
    );
    const className = 'type' + (type == currentType ? ' current' : '');

    return (
        <li className={className} onClick={handleClick}>
            {type}
            {pending > 0 ? ` (${pending})` : ''}
        </li>
    );
};

const TodoType = ({ tableId, rowId }) => {
    const type = useCell(tableId, rowId, 'type');
    const checkpoints = useCheckpoints();
    const handleChange = useSetCellCallback(
        tableId,
        rowId,
        'type',
        ({ target: { value } }) => value,
        [],
        undefined,
        (_store, type) => checkpoints.addCheckpoint(`changing to '${type}'`),
        [checkpoints],
    );

    return (
        <select className="type" onChange={handleChange} value={type}>
            {TYPES.map((type) => (
                <option>{type}</option>
            ))}
        </select>
    );
};

const UndoRedo = () => {
    const [canUndo, handleUndo, , undoLabel] = useUndoInformation();
    const undo = canUndo ? (
        <div id="undo" onClick={handleUndo}>
            undo {undoLabel}
        </div>
    ) : (
        <div id="undo" className="disabled" />
    );

    const [canRedo, handleRedo, , redoLabel] = useRedoInformation();
    const redo = canRedo ? (
        <div id="redo" onClick={handleRedo}>
            redo {redoLabel}
        </div>
    ) : (
        <div id="redo" className="disabled" />
    );

    return (
        <div id="undoRedo">
            {undo}
            {redo}
        </div>
    );
};

const WS_SERVER = 'wss://todo.demo.tinybase.org/';

const useServerPathId = () => {
    const [serverPathId, setServerPathId] = useState(
        parent.location.search.substring(1),
    );
    return [
        serverPathId,
        useCallback(() => {
            const newServerPathId = getUniqueId();
            parent.history.replaceState(null, null, '?' + newServerPathId);
            setServerPathId(newServerPathId);
        }, []),
    ];
};

const Share = ({ serverPathId, createServerPathId }) => (
    <div id="share">
        {serverPathId ? (
            <a href={'?' + serverPathId} target="_blank">
                &#128279; Share link
            </a>
        ) : (
            <span onClick={createServerPathId}>&#128228; Start sharing</span>
        )}
    </div>
);