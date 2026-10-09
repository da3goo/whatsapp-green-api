import { useState, useRef, useEffect } from 'react';
import { extractPhone } from '../api/greenApi';

export default function ChatWindow({ chat, onSendMessage, onBack }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // автоскрол
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="chat-window-empty">
        <div className="empty-icon">💬</div>
        <h3>WhatsApp Green API</h3>
        <p>Выберите чат или создайте новый для начала переписки</p>
      </div>
    );
  }

  const phoneNumber = extractPhone(chat.chatId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(chat.chatId, text.trim());
      setText('');
    } catch (err) {
      console.error('Ошибка отправки:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="chat-avatar">👤</div>
        <div className="chat-header-info">
          <h3>{chat.name || phoneNumber}</h3>
          <p>WhatsApp</p>
        </div>
      </div>

      <div className="messages-area">
        {chat.messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#667781',
              fontSize: 13,
              marginTop: 20,
              background: '#fff',
              padding: '8px 16px',
              borderRadius: 8,
              alignSelf: 'center',
              boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
            }}
          >
            Здесь пока пусто. Напишите что-нибудь!
          </div>
        )}

        {chat.messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`message ${msg.fromMe ? 'outgoing' : 'incoming'}`}
          >
            <span className="message-text">{msg.text}</span>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Введите сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!text.trim() || sending}>
          ➤
        </button>
      </form>
    </div>
  );
}
