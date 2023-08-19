import './App.css';
import { useState, useEffect } from 'react';

function TodoList({ todos, search, toggleComplete }) {
  let filteredTodos = todos.sort((a,b) => a.content.localeCompare(b.content));

  if(search) {
    filteredTodos = todos.filter(todo => {
      return todo.content.toLowerCase().includes(search.toLowerCase()); 
    });
  }

  return (
    <ul id="sortable" class="list-unstyled">
      {filteredTodos.map(todo => (
        <li class="ui-state-default" key={todo._id}>
          <div class="checkbox">
          {/* The onChange handler needs to accept the change event: */}
            <label><input type="checkbox" onChange={(event) => toggleComplete(todo._id)} />  {todo.content}</label>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DoneList({ dones, search, toggleUncompleted }) {
  let filteredDones = dones.sort((a,b) => a.content.localeCompare(b.content));

  if(search) {
    filteredDones = dones.filter(done => {
      return done.content.toLowerCase().includes(search.toLowerCase()); 
    });
  }

  return (
    <ul id="done-items" class="list-unstyled">
      {filteredDones.map(done => (
        <li key={done._id}>
          {/* The onChange handler needs to accept the change event: */}
          <input type="checkbox" defaultChecked onChange={ (event) => toggleUncompleted(done._id)} />  {done.content}
        </li>
      ))}
    </ul>
  );
}

function TodoForm(props) {
  const [text, setText] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    props.addTodo(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="input-group mb-3">
        <input type="text" class="form-control" value={text} onChange={e => setText(e.target.value)}  />
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="submit" >Add</button>
        </div>
      </div>
    </form>
  );
}


function App(props) {
  const baseURL = 'http://localhost:8000';
  const [todos, setTodos] = useState([]);
  const [dones, setDones] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTodos();
    fetchDones();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch(`${baseURL}/tasks/doing`);
    const data = await res.json();
    setTodos(data);
  };

  const fetchDones = async () => {
    const res = await fetch(`${baseURL}/tasks/done`);
    const data = await res.json();
    setDones(data);
  };
  
  const addTodo = async (text) => {
    const res = await fetch(`${baseURL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content:text, date: new Date(), status:'doing' })
    });
    const result = await res.json();
    const newTodo = { _id: result.insertedId, content: text, date: new Date(), status:'doing'}

    setTodos([...todos, newTodo]);
  };

  const toggleComplete = async (id) => {
    fetch(`${baseURL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status:'done' })
    });
  
    const updatedTodos = todos.filter(todo => todo._id !== id);
    const completedItem = todos.find(todo => todo._id === id);
  
    setTodos(updatedTodos);
    setDones([...dones, completedItem]);
  }

  const toggleUncompleted = async (id) => {
    fetch(`${baseURL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status:'doing' })
    });
  
    const updatedDones = dones.filter(done => done._id !== id);
    const uncompletedItem = dones.find(done => done._id === id);
  
    setDones(updatedDones);
    setTodos([...todos, uncompletedItem]);
  }

  const deleteAllTasks = async () => {
    const isSure = window.confirm(
      'ARE YOU SURE to delete all tasks? It cannot be restored!'
    )

    if (isSure === true) {
      await fetch(`${baseURL}/tasks/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      setTodos([]);
      setDones([]);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
      </header>
      <div class="container">
        <div class="row">
            <div class="col-md-6">
              <h1>Marvelous v2.0</h1>
            </div>
            <div class="col-md-6">
              <button type="button" class="btn btn-link" onClick={deleteAllTasks}>Delete all tasks</button>
            </div>
            <div class="col-md-6">
                <div class="todolist not-done">
                  <TodoForm addTodo={addTodo} />
                  <h3>To Do</h3><hr />
                  <TodoList todos={todos} search={search} toggleComplete={toggleComplete} />
                </div>
            </div>
            <div class="col-md-6">
                <div class="todolist">
                <div class="input-group mb-3">
                  <input type="text" class="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}  />
                </div>
                  <h3>Done</h3>
                  <hr />
                  <DoneList dones={dones} search={search} toggleUncompleted={toggleUncompleted} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
