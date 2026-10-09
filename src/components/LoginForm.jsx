import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните оба поля');
      return;
    }

    onLogin(idInstance.trim(), apiTokenInstance.trim());
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo">💬</div>
        <h1>WhatsApp Chat</h1>
        <p>Введите данные вашего аккаунта GREEN API</p>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
