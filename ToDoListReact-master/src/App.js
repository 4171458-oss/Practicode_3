import React, { useState, useEffect } from "react";
import service from "./service.js";
import "./App.css";

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("login"); // "login" | "register" | "todos"
  const [errorMessage, setErrorMessage] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // ===================== AUTH =====================
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await service.login(username, password);
      setUserLoggedIn(true);
      setCurrentScreen("todos");
    } catch (error) {
      setErrorMessage("שם משתמש או סיסמה שגויים");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await service.register(username, password);
      setErrorMessage("הרשמה הצליחה! התחברי עכשיו");
      setCurrentScreen("login");
      setUsername("");
      setPassword("");
    } catch (error) {
      setErrorMessage("הרשמה נכשלה: " + (error.response?.data?.message || error.response?.data || error.message));
    }
  };

  const handleLogout = (e) => {
    e?.preventDefault();
    service.logout();
    setUserLoggedIn(false);
    setCurrentScreen("login");
    setUsername("");
    setPassword("");
    setTodos([]);
    setErrorMessage("");
  };

  // ===================== TODOS =====================
  const getTodos = async () => {
    try {
      const data = await service.getTasks();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        setTodos([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setCurrentScreen("login");
        setErrorMessage("ההתחברות פגה. נא להתחבר מחדש");
        setTodos([]);
      } else {
        setTodos([]);
        setErrorMessage("שגיאה בטעינת המשימות");
      }
    }
  };

  
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todoToAdd = newTodo.trim();
    setNewTodo("");
    try {
      await service.addTask(todoToAdd);
      await getTodos();
    } catch (error) {
      setNewTodo(todoToAdd);
      setErrorMessage("שגיאה בהוספת משימה");
      if (error.response && error.response.status === 401) {
        setCurrentScreen("login");
      }
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await service.setCompleted(todo.id, todo.name, !todo.isComplete);
      getTodos();
    } catch (error) {
      setErrorMessage("שגיאה בעדכון משימה");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await service.deleteTask(id);
      getTodos();
    } catch (error) {
      setErrorMessage("שגיאה במחיקת משימה");
    }
  };

  // בדיקה אם המשתמש מחובר וטעינת משימות
  useEffect(() => {
    if (currentScreen === "todos") {
      const token = localStorage.getItem('jwt');
      if (token) {
        getTodos();
      } else {
        // אם אין JWT אבל המשתמש מנסה לגשת למשימות, מעבירים לדף התחברות
        setCurrentScreen("login");
        setErrorMessage("נא להתחבר כדי לראות את המשימות");
      }
    }
  }, [currentScreen]);

  // ===================== RENDER =====================
  if (currentScreen === "login") {
    return (
      <div className="app-container">
        <div className="auth-container">
          <h2>🔐 התחברות</h2>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleLogin} className="auth-form">
            <input 
              type="text" 
              placeholder="שם משתמש" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              className="form-input"
            />
            <input 
              type="password" 
              placeholder="סיסמה" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
            <button type="submit" className="btn-primary">התחבר</button>
          </form>
          <div className="switch-auth">
            אין לך חשבון? 
            <button onClick={() => { setCurrentScreen("register"); setErrorMessage(""); }} className="btn-link">
              הירשם כאן
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "register") {
    return (
      <div className="app-container">
        <div className="auth-container">
          <h2>📝 הרשמה</h2>
          {errorMessage && (
            <div className={errorMessage.includes("הצליחה") ? "success-message" : "error-message"}>
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleRegister} className="auth-form">
            <input 
              type="text" 
              placeholder="שם משתמש" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              className="form-input"
            />
            <input 
              type="password" 
              placeholder="סיסמה" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
            <button type="submit" className="btn-primary">הירשם</button>
          </form>
          <div className="switch-auth">
            כבר יש לך חשבון? 
            <button onClick={() => { setCurrentScreen("login"); setErrorMessage(""); }} className="btn-link">
              התחבר כאן
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== TODOS SCREEN =====================
  // בדיקה נוספת - אם אין JWT, לא מציגים את המסך
  const token = localStorage.getItem('jwt');
  if (!token) {
    return (
      <div className="app-container">
        <div className="auth-container">
          <h2>🔐 התחברות</h2>
          <div className="error-message">נא להתחבר כדי לראות את המשימות</div>
          <form onSubmit={handleLogin} className="auth-form">
            <input 
              type="text" 
              placeholder="שם משתמש" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              className="form-input"
            />
            <input 
              type="password" 
              placeholder="סיסמה" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
            <button type="submit" className="btn-primary">התחבר</button>
          </form>
          <div className="switch-auth">
            אין לך חשבון? 
            <button onClick={() => { setCurrentScreen("register"); setErrorMessage(""); }} className="btn-link">
              הירשם כאן
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="todos-container">
        <div className="todos-header">
          <h2>📋 המשימות שלי</h2>
          <button onClick={handleLogout} className="btn-logout">התנתק</button>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <form onSubmit={addTodo} className="add-todo-form">
          <input 
            type="text" 
            placeholder="הוסף משימה חדשה..." 
            value={newTodo} 
            onChange={e => setNewTodo(e.target.value)} 
            className="add-todo-input"
          />
          <button type="submit" className="btn-add">➕ הוסף</button>
        </form>
        
        {!Array.isArray(todos) || todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">אין משימות עדיין. תתחיל להוסיף!</div>
          </div>
        ) : (
          <ul className="todos-list">
            {todos.map(todo => (
              <li key={todo.id} className="todo-item">
                <input 
                  type="checkbox" 
                  checked={todo.isComplete} 
                  onChange={() => toggleComplete(todo)} 
                  className="todo-checkbox"
                />
                <span className={`todo-text ${todo.isComplete ? 'completed' : ''}`}>
                  {todo.name}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="btn-delete">
                  🗑️ מחק
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
