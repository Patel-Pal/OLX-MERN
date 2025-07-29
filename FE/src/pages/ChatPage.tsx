import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import io, { Socket } from 'socket.io-client';

interface Message {
  _id: string;
  productId: string;
  senderId: { _id: string; name: string; email: string };
  receiverId: { _id: string; name: string; email: string };
  message: string;
  createdAt: string;
}

interface Buyer {
  id: string;
  name: string;
}

const ChatPage = () => {
  const { productId, buyerId, sellerId } = useParams<{ productId: string; buyerId: string; sellerId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(buyerId || null);
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
    if (buyerId && sellerId && buyerId === sellerId) {
      console.error('Invalid chat parameters: buyerId and sellerId are the same');
      navigate(-1);
      return;
    }

    // Initialize Socket.IO
    socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      reconnection: true,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    // Fetch chat history and buyers
    const fetchChatData = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${productId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        setMessages(res.data.messages);

        // If seller, fetch unique buyers who have sent messages
        if (currentUserId === sellerId) {
          const buyerList = res.data.messages
            .filter((msg: Message) => msg.senderId._id !== currentUserId)
            .map((msg: Message) => ({
              id: msg.senderId._id,
              name: msg.senderId.name,
            }))
            .filter(
              (value: Buyer, index: number, self: Buyer[]) =>
                self.findIndex((v) => v.id === value.id) === index
            );
          setBuyers(buyerList);

          // Set default selected buyer if none is selected
          if (!selectedBuyerId && buyerList.length > 0) {
            setSelectedBuyerId(buyerList[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChatData();

    // Join room based on selected buyer
    if (selectedBuyerId && productId && sellerId) {
      const sortedIds = [selectedBuyerId, sellerId].sort();
      const room = `${productId}-${sortedIds[0]}-${sortedIds[1]}`;
      console.log('Joining room:', room);
      socketRef.current.emit('joinRoom', { productId, buyerId: selectedBuyerId, sellerId });
    }

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [productId, buyerId, sellerId, navigate, currentUserId, selectedBuyerId]);

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current && currentUserId && selectedBuyerId) {
      const isBuyer = currentUserId === selectedBuyerId;
      const senderId = isBuyer ? selectedBuyerId : sellerId;
      const receiverId = isBuyer ? sellerId : selectedBuyerId;

      // Validate sender and receiver IDs
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

  const handleBuyerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBuyerId = e.target.value;
    setSelectedBuyerId(newBuyerId);
    navigate(`/chat/${productId}/${newBuyerId}/${sellerId}`);
  };

  // Filter messages based on selected buyer
  const filteredMessages = selectedBuyerId
    ? messages.filter(
        (msg) =>
          (msg.senderId._id === selectedBuyerId && msg.receiverId._id === sellerId) ||
          (msg.senderId._id === sellerId && msg.receiverId._id === selectedBuyerId)
      )
    : messages;

 return (
  <div className="max-w-xl mx-auto px-3 py-6">
    <button
      className="mb-3 bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 text-sm"
      onClick={() => navigate(-1)}
    >
      Back
    </button>

    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">
        Chat - Product ID: {productId}
      </h2>

      {/* Buyer selection dropdown for seller */}
      {currentUserId === sellerId && buyers.length > 0 && (
        <div className="mb-3">
          <label
            htmlFor="buyerSelect"
            className="block text-xs font-medium text-gray-600"
          >
            Select Buyer
          </label>
          <select
            id="buyerSelect"
            value={selectedBuyerId || ''}
            onChange={handleBuyerChange}
            className="mt-1 w-full p-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {buyers.map((buyer) => (
              <option key={buyer.id} value={buyer.id}>
                {buyer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="h-72 overflow-y-auto mb-3 p-2 bg-gray-100 rounded text-sm space-y-2">
        {filteredMessages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-md break-words ${
              msg.senderId._id === currentUserId
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-200 mr-auto text-left'
            } max-w-[70%]`}
          >
            <p className="font-medium text-xs text-gray-700">{msg.senderId.name}</p>
            <p className="text-sm">{msg.message}</p>
            <p className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  </div>
);

};

export default ChatPage;