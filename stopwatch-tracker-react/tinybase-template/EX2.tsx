const { createStore } = TinyBase;
const {
    CellView,
    Provider,
    TableView,
    useAddRowCallback,
    useCell,
    useCreateStore,
    useSetCellCallback,
} = TinyBaseUiReact;
const { useCallback, useState } = React;
const { Inspector } = TinyBaseUiReactInspector;

const INITIAL_TODOS = {
    todos: {
        0: { text: 'Clean the floor' },
        1: { text: 'Install TinyBase' },
        2: { text: 'Book holiday' },
    },
};

const App = () => {
    const store = useCreateStore(() => createStore().setTables(INITIAL_TODOS));

    return (
        <Provider store={store}>
            <Title />
            <NewTodo />
            <Todos />
            <Inspector />
        </Provider>
    );
};

window.addEventListener('load', () =>
    ReactDOM.createRoot(document.body).render(<App />),
);

const Title = () => 'Todos';

const NewTodo = () => {
    const [text, setText] = useState('');
    const handleChange = useCallback(({ target: { value } }) => setText(value), []);
    const handleKeyDown = useAddRowCallback(
        'todos',
        ({ which, target: { value: text } }) =>
            which == 13 && text != '' ? { text } : null,
        [],
        undefined,
        () => setText(''),
        [setText],
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
        <TableView tableId="todos" rowComponent={Todo} />
    </ul>
);

const Todo = (props) => (
    <li className="todo">
        <TodoText {...props} />
    </li>
);

const TodoText = ({ tableId, rowId }) => {
    const done = useCell(tableId, rowId, 'done');
    const className = 'text' + (done ? ' done' : '');
    const handleClick = useSetCellCallback(tableId, rowId, 'done', () => !done, [
        done,
    ]);

    return (
        <span className={className} onClick={handleClick}>
            <CellView tableId={tableId} rowId={rowId} cellId="text" />
        </span>
    );
};