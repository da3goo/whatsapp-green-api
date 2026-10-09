import { useState } from 'react';
import { extractPhone } from '../api/greenApi';

export default function ChatList({ chats, activeChat, onSelectChat, onCreateChat }) {
  const [phone, setPhone] = useState('');

  const handleCreateChat = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    onCreateChat(phone.trim());
    setPhone('');
  };

  return (
    <>
      <form className="new-chat-form" onSubmit={handleCreateChat}>
        <input
          type="text"
          placeholder="Номер телефона (79001234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit">Новый чат</button>
      </form>

      <div className="chat-list">
        {chats.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#667781', fontSize: 14 }}>
            Создайте новый чат, введя номер телефона
          </div>
        )}

        {chats.map((chat) => {
          const phoneNumber = extractPhone(chat.chatId);
          const lastMsg = chat.messages[chat.messages.length - 1];

          return (
            <div
              key={chat.chatId}
              className={`chat-item ${activeChat === chat.chatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.chatId)}
            >
              <div className="chat-avatar">👤</div>
              <div className="chat-info">
                <div className="chat-name">
                  {chat.name || phoneNumber}
                </div>
                {lastMsg && (
                  <div className="chat-last-msg">
                    {lastMsg.fromMe ? '✓ ' : ''}
                    {lastMsg.text}
                  </div>
                )}
              </div>
              {lastMsg && (
                <div className="chat-meta">
                  <span className="chat-time">
                    {new Date(lastMsg.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {chat.unread > 0 && (
                    <span className="unread-badge">{chat.unread}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
