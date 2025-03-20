import { useState, useEffect } from "react";
import { Send, Users } from "lucide-react";
import io from "socket.io-client";
import image from "../img/avatar.jpg";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]); // Combines chat history and new messages
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState([]);

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io("http://127.0.0.1:5000", {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("res_hello", (data) => {
      console.log(data, "Connected to server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [friends]);

  // Fetch Friends List
  useEffect(() => {
    async function getFriendsList() {
      try {
        const res = await fetch("http://127.0.0.1:5000/getFriendList", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setFriends(data);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
    getFriendsList();
  }, []);

  // Listen for Incoming Messages via Socket
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (serverMsg) => {
      // Transform socket message to match component's format
      const transformedMsg = {
        text: serverMsg.message,
        sender: serverMsg.sender,
        timestamp: new Date(serverMsg.createdAt).toLocaleTimeString(),
        _id: serverMsg._id,
      };
      setMessages((prev) => [...prev, transformedMsg]);
    };

    socket.on("message", messageHandler);

    return () => {
      socket.off("message", messageHandler);
    };
  }, [socket]);

  // Fetch Chat Messages when Friend is Selected
  const getChatMessages = async (friend) => {
    setSelectedFriend(friend);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/chatMessages?receiver=${friend._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch messages");

      const data = await res.json();
      console.log(data, "Fetched Chat History");

      // Transform server data to match component's expected format
      const transformedMessages = data.map((msg) => ({
        text: msg.message, // Map 'message' field to 'text'
        sender: msg.sender,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(), // Convert ISO date
        _id: msg._id,
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send Message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !socket) return;

    const newMsg = {
      text: newMessage,
      sender: userId,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMsg]); // Append the new message to the messages state

    socket.emit("sendMessage", {
      receiver: selectedFriend._id,
      sender: userId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
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
          {friends.map((friend) => (
            <div
              key={friend._id}
              onClick={() => getChatMessages(friend)}
              className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedFriend?._id === friend._id ? "bg-blue-50" : ""
              }`}
            >
              <img
                src={image}
                alt={friend.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{friend.name}</h3>
                <p className="text-sm text-gray-500">
                  {messages.length > 0 && messages[messages.length - 1]?.text
                    ? messages[messages.length - 1].text.substring(0, 20) +
                      "..."
                    : "No messages yet"}
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
                  src={image}
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === userId
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {message.timestamp || "Unknown time"}
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
              <h2 className="text-xl font-semibold">
                Select a friend to start chatting
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
