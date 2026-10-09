import { useState, useEffect, useCallback, useRef } from 'react';
import LoginForm from './components/LoginForm';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import {
  sendMessage,
  receiveNotification,
  deleteNotification,
  formatChatId,
  extractTextFromNotification,
} from './api/greenApi';

export default function App() {
  const [credentials, setCredentials] = useState(null);

  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const pollingRef = useRef(null);
  const credentialsRef = useRef(null);

  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  const pollMessages = useCallback(async () => {
    if (!credentialsRef.current) return;

    const { idInstance, apiTokenInstance } = credentialsRef.current;

    try {
      const notification = await receiveNotification(idInstance, apiTokenInstance);

      if (notification) {
        const receiptId = notification.receiptId;
        const body = notification.body;

        if (body?.typeWebhook === 'incomingMessageReceived') {
          const text = extractTextFromNotification(notification);
          const senderChatId = body.senderData?.chatId;
          const senderName = body.senderData?.senderName || body.senderData?.chatName;
          const idMessage = body.idMessage;
          const timestamp = body.timestamp ? body.timestamp * 1000 : Date.now();

          if (text && senderChatId) {
            console.log('получили новое сообщение:', text); // TODO: убрать потом
            
            setChats((prev) => {
              const existing = prev[senderChatId] || {
                chatId: senderChatId,
                name: senderName || '',
                messages: [],
                unread: 0,
              };

              const isDuplicate = existing.messages.some((m) => m.id === idMessage);
              if (isDuplicate) return prev;

              return {
                ...prev,
                [senderChatId]: {
                  ...existing,
                  name: senderName || existing.name,
                  messages: [
                    ...existing.messages,
                    {
                      id: idMessage,
                      text,
                      fromMe: false,
                      timestamp,
                    },
                  ],
                  unread: existing.unread + 1,
                },
              };
            });
          }
        }

        await deleteNotification(idInstance, apiTokenInstance, receiptId);
      }
    } catch (err) {
      console.error('ошибка поллинга:', err);
    }
  }, []);

  useEffect(() => {
    if (credentials) {
      const poll = async () => {
        await pollMessages();
        pollingRef.current = setTimeout(poll, 5000);
      };
      poll();
    }

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [credentials, pollMessages]);

  const handleLogin = (idInstance, apiTokenInstance) => {
    setCredentials({ idInstance, apiTokenInstance });
  };

  const handleLogout = () => {
    setCredentials(null);
    setChats({});
    setActiveChat(null);
  };

  const handleCreateChat = (phone) => {
    const chatId = formatChatId(phone);

    if (!chats[chatId]) {
      setChats((prev) => ({
        ...prev,
        [chatId]: {
          chatId,
          name: '',
          messages: [],
          unread: 0,
        },
      }));
    }

    setActiveChat(chatId);
    setIsMobileChatOpen(true);
  };

  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
    setIsMobileChatOpen(true);

    setChats((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        unread: 0,
      },
    }));
  };

  const handleSendMessage = async (chatId, text) => {
    if (!credentials) return;

    const { idInstance, apiTokenInstance } = credentials;

    const result = await sendMessage(idInstance, apiTokenInstance, chatId, text);

    setChats((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages: [
          ...prev[chatId].messages,
          {
            id: result.idMessage,
            text,
            fromMe: true,
            timestamp: Date.now(),
          },
        ],
      },
    }));
  };

  const handleBack = () => {
    setIsMobileChatOpen(false);
  };

  if (!credentials) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const sortedChats = Object.values(chats).sort((a, b) => {
    const aTime = a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0;
    const bTime = b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0;
    return bTime - aTime;
  });

  const activeChatData = activeChat ? chats[activeChat] : null;

  return (
    <div className={`chat-app ${isMobileChatOpen ? 'chat-open' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💬 WhatsApp</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
        <ChatList
          chats={sortedChats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
        />
      </div>

      <ChatWindow
        chat={activeChatData}
        onSendMessage={handleSendMessage}
        onBack={handleBack}
      />
    </div>
  );
}
