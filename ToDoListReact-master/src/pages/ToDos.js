import React, { useEffect, useState } from 'react';
import service from '../service';

export default function ToDos({ onLogout }) {
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState([]);

  const getTodos = async () => {
    const data = await service.getTasks();
    setTodos(data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    await service.addTask(newTodo);
    setNewTodo('');
    getTodos();
  };

  const updateCompleted = async (todo, isComplete) => {
    await service.setCompleted(todo.id, isComplete);
    getTodos();
  };

  const deleteTodo = async (id) => {
    await service.deleteTask(id);
    getTodos();
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div>
      <button onClick={onLogout}>Logout</button>
      <h2>Todos</h2>
      <form onSubmit={addTodo}>
        <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="New task" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.isComplete} onChange={e => updateCompleted(todo, e.target.checked)} />
            {todo.name}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
