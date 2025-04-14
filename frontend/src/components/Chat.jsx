import { useState, useEffect, useRef } from "react";
import { Send, Users, MessageCircle, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import image from "../img/avatar.jpg";
import axios from "axios";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("name");
const profileUrl = localStorage.getItem("photo") || image;

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch Friends List
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

  useEffect(() => {
    getFriendsList();
  }, [setNewMessage]);

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

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for Incoming Messages via Socket
  useEffect(() => {
    if (!socket) return;

    const messageHandler = async (serverMsg) => {
      console.log("Received message:", serverMsg);
      await getFriendsList();
      const transformedMsg = {
        text: serverMsg.message,
        sender: serverMsg.sender,
        status: serverMsg.status,

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

  // Count delivered messages for a specific friend
  const countDeliveredMessages = (friendId) => {
    const friend = friends.find((f) => f._id === friendId);
    const cachedCount = friend?.deliveredMessageCount || 0;
    console.log(cachedCount, "<<<<<<<<<<<<<<<");
    return cachedCount;
  };

  // Fetch Chat Messages when Friend is Selected
  const getChatMessages = async (friend) => {
    setSelectedFriend(friend);
    if (isMobileView) {
      setShowSidebar(false);
    }

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
      console.log(data);

      const transformedMessages = data.map((msg) => ({
        text: msg.message,
        sender: msg.sender._id,
        status: msg.status,
        resProfileUrl: msg.sender.photo,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        _id: msg._id,
      }));

      setMessages(transformedMessages);

      // Mark messages as read when opening chat
      const unreadMessages = transformedMessages.filter(
        (msg) => msg.sender._id === friend._id && msg.status === "delivered"
      );

      if (unreadMessages.length > 0) {
        try {
          await socket.emit("markAsRead", {
            unreadMessages: unreadMessages.map((msg) => msg._id),
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
      setFriends([...friends], (friend.deliveredMessageCount = 0));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send Message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !socket) return;

    socket.emit("sendMessage", {
      receiver: selectedFriend._id,
      sender: userId,
      message: newMessage,
    });
    getFriendsList();
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for message timestamps
  const formatTimestamp = (timestamp) => {
    return (
      timestamp ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Delete the message
  const handleDeleteMessage = async (id) => {
    console.log("Deleting message with ID:", id);
    try {
      if (!id) return;

      const res = await axios.delete(
        "http://localhost:5000/chat/deleteMessage",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: {
            messageId: id,
          },
        }
      );

      console.log("Delete response:", res.data);

      if (res.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== id));
      } else {
        console.error("Error deleting message:", res.data.message);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={isMobileView ? { x: -300 } : { x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${
              isMobileView ? "absolute z-10 h-full" : "relative"
            } w-80 bg-white shadow-lg flex flex-col`}
          >
            {/* User Profile Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={profileUrl}
                      alt="Your Profile"
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <h2 className="font-bold">{userName || "Your Name"}</h2>
                </div>
                <div className="flex space-x-2">
                  {isMobileView && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSidebar(false)}
                      className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                    >
                      <ArrowLeft size={18} />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-10 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 bg-indigo-50">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-medium text-indigo-700 text-sm">
                    FRIENDS ({friends.length})
                  </h3>
                </div>
              </div>

              <AnimatePresence>
                {filteredFriends.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-center text-gray-500"
                  >
                    No friends found
                  </motion.div>
                ) : (
                  filteredFriends.map((friend, index) => (
                    <motion.div
                      key={friend._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => getChatMessages(friend)}
                      className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-indigo-50 transition-colors border-l-4 ${
                        selectedFriend?._id === friend._id
                          ? "border-l-indigo-500 bg-indigo-50"
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={friend.photo || image}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">
                            {friend.name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            12:30 PM
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-sm text-gray-500 truncate w-48">
                            {messages.find((m) => m.sender === friend._id)
                              ?.text || "No messages yet"}
                          </p>
                          {countDeliveredMessages(friend._id) > 0 && (
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: 0 }}
                              className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-500 rounded-full"
                            >
                              {countDeliveredMessages(friend._id)}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                {isMobileView && !showSidebar && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSidebar(true)}
                    className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50"
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                )}

                <div className="relative">
                  <img
                    src={selectedFriend.photo || image}
                    alt={selectedFriend.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {selectedFriend.name}
                  </h2>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            </motion.div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id || index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className={`flex ${
                      message.sender === userId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender !== userId && (
                      <img
                        src={message.resProfileUrl || image}
                        alt={selectedFriend.name}
                        className="w-8 h-8 rounded-full mr-2 self-end mb-2"
                      />
                    )}

                    <div
                      className={`relative max-w-[70%] rounded-2xl p-3 shadow-sm ${
                        message.sender === userId
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p
                          className={`text-xs ${
                            message.sender === userId
                              ? "text-indigo-100"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </p>
                        {message.sender === userId && (
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="ml-2 text-xs text-red-300 hover:text-red-500"
                            title="Delete message"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {message.sender === userId && (
                      <img
                        src={profileUrl || image}
                        alt="You"
                        className="w-8 h-8 rounded-full ml-2 self-end mb-2"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white border-t border-gray-200 shadow-md"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.2,
              }}
              className="text-center p-8 rounded-xl bg-white bg-opacity-60 backdrop-blur-sm shadow-lg"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-indigo-200 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <MessageCircle className="h-12 w-12 text-indigo-600" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-indigo-700 mb-2">
                Start Chatting
              </h2>
              <p className="text-gray-600 max-w-xs mx-auto">
                Select a friend from the list to start a conversation
              </p>

              {isMobileView && !showSidebar && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSidebar(true)}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg"
                >
                  View Friends List
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Chat;
