import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';

interface Message {
  _id: string;
  productId: string;
  senderId: { _id: string; name: string; email: string };
  receiverId: { _id: string; name: string; email: string };
  message: string;
  createdAt: string;
}

const ChatPage = () => {
  const { productId, buyerId, sellerId } = useParams<{ productId: string; buyerId: string; sellerId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const currentUserId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    // Log parameters for debugging
    console.log('ChatPage params:', { productId, buyerId, sellerId, currentUserId });

    // Validate buyerId and sellerId
    if (buyerId === sellerId) {
      console.error('Invalid chat parameters: buyerId and sellerId are the same');
      navigate(-1); // Redirect back if IDs are invalid
      return;
    }

    // Initialize Socket.IO
    socketRef.current = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    // Normalize room by sorting buyerId and sellerId
    const sortedIds = [buyerId, sellerId].sort();
    const room = `${productId}-${sortedIds[0]}-${sortedIds[1]}`;
    socketRef.current.emit('joinRoom', { productId, buyerId, sellerId });

    // Fetch chat history
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/${productId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        setMessages(res.data.messages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [productId, buyerId, sellerId, navigate]);

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
  if (newMessage.trim() && socketRef.current && currentUserId) {
    const isBuyer = currentUserId === buyerId;
    const senderId = isBuyer ? buyerId : sellerId;
    const receiverId = isBuyer ? sellerId : buyerId;
    if (senderId === receiverId) {
      console.error('Sender and receiver IDs cannot be the same:', { senderId, receiverId });
      return;
    }
    socketRef.current.emit('sendMessage', {
      productId,
      senderId,
      receiverId,
      message: newMessage,
    });
    setNewMessage('');
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Chat for Product ID: {productId}</h2>
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-md">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-2 p-2 rounded-md ${
                msg.senderId._id === currentUserId ? 'bg-blue-100 ml-auto' : 'bg-gray-200 mr-auto'
              } max-w-[70%]`}
            >
              <p className="text-sm font-semibold">{msg.senderId.name}</p>
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;