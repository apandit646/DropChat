import { useState } from 'react';
import { Send, Users } from 'lucide-react';

const friends = [
  { id: 1, name: 'Alice', avatar: '/api/placeholder/40/40' },
  { id: 2, name: 'Bob', avatar: '/api/placeholder/40/40' },
  { id: 3, name: 'Charlie', avatar: '/api/placeholder/40/40' },
  { id: 4, name: 'David', avatar: '/api/placeholder/40/40' },
];

const initialMessages = {
  1: [
    { id: 1, text: "Hey, how are you?", sender: "Alice", timestamp: "10:00 AM" },
    { id: 2, text: "I'm good, thanks!", sender: "me", timestamp: "10:01 AM" }
  ],
  2: [
    { id: 1, text: "Want to grab lunch?", sender: "Bob", timestamp: "9:30 AM" }
  ],
  3: [],
  4: []
};

const Chat = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
 

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const newMsg = {
      id: messages[selectedFriend.id].length + 1,
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [selectedFriend.id]: [...prev[selectedFriend.id], newMsg]
    }));
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">Friends</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.map(friend => (
            <div
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedFriend?.id === friend.id ? 'bg-blue-50' : ''}`}
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{friend.name}</h3>
                <p className="text-sm text-gray-500">
                  {messages[friend.id].length > 0 
                    ? messages[friend.id][messages[friend.id].length - 1].text.substring(0, 20) + '...'
                    : 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedFriend.avatar}
                  alt={selectedFriend.name}
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedFriend.name}
                </h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages[selectedFriend.id].map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'me'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Select a friend to start chatting</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;