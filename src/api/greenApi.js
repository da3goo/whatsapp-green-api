const API_URL = 'https://api.green-api.com';

// отправка сообщения
export async function sendMessage(idInstance, apiTokenInstance, chatId, message) {
  const url = `${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  if (!response.ok) {
    throw new Error(`Ошибка отправки: ${response.status}`);
  }

  return response.json();
}

//  новые уведомления
export async function receiveNotification(idInstance, apiTokenInstance) {
  const url = `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка получения: ${response.status}`);
  }

  const data = await response.json();
  return data; 
}

export async function deleteNotification(idInstance, apiTokenInstance, receiptId) {
  const url = `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Ошибка удаления уведомления: ${response.status}`);
  }

  return response.json();
}

export function formatChatId(phone) {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@c.us`;
}

export function extractPhone(chatId) {
  return chatId.replace('@c.us', '').replace('@g.us', '');
}

// для парсинг
export function extractTextFromNotification(notification) {
  const body = notification?.body;
  if (!body) return null;

  if (body.typeWebhook !== 'incomingMessageReceived') return null;

  const messageData = body.messageData;
  if (!messageData) return null;

  if (messageData.typeMessage === 'textMessage') {
    return messageData.textMessageData?.textMessage || null;
  }

  if (messageData.typeMessage === 'extendedTextMessage') {
    return messageData.extendedTextMessageData?.text || null;
  }

  return null;
}
