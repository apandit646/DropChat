import { useState, useEffect } from "react";
import { Send, Users, X } from "lucide-react";
import io from "socket.io-client";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

const GroupChat = () => {
  const [socket, setSocket] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState([]);
  const [group, setgroup] = useState([]);
  const [isGroupFormVisible, setIsGroupFormVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

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
    async function getFriendsGroupList() {
      try {
        const res = await fetch("http://127.0.0.1:5000/getFriendGroupList", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("group", data);
        if (Array.isArray(data)) {
          setgroup(data);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
    getFriendsGroupList();
  }, []);

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

      const transformedMessages = data.map((msg) => ({
        text: msg.message,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
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

    setMessages((prev) => [...prev, newMsg]);

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

  // Handle Group Creation
  const handleCreateGroup = () => {
    setIsGroupFormVisible(true);
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleMemberSelection = (friend) => {
    if (selectedMembers.includes(friend._id)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== friend._id));
    } else {
      setSelectedMembers([...selectedMembers, friend._id]);
    }
  };

  const handleGroupSubmit = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          members: [...selectedMembers],
        }),
      });

      if (!res.ok) throw new Error("Failed to create group");

      const data = await res.json();
      console.log(data, "Group Created");

      // Reset form and close it
      setGroupName("");
      setSelectedMembers([]);
      setIsGroupFormVisible(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">Friends</h2>
          </div>
          <button
            onClick={handleCreateGroup}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            <span className="font-medium">Create Group</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {group.map((friend) => (
            <div
              key={friend._id}
              onClick={() => getChatMessages(friend)}
              className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedFriend?._id === friend._id ? "bg-blue-50" : ""
              }`}
            >
              <img
                src={friend.avatar || "/default-avatar.png"}
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
                  src={selectedFriend.avatar || "/default-avatar.png"}
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

      {/* Group Creation Form */}
      {isGroupFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Group</h2>
              <button
                onClick={() => setIsGroupFormVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <input
              type="text"
              value={groupName}
              onChange={handleGroupNameChange}
              placeholder="Group Name"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Select Members</h3>
              <div className="max-h-40 overflow-y-auto">
                {group.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleMemberSelection(friend)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(friend._id)}
                      onChange={() => handleMemberSelection(friend)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <img
                      src={friend.avatar || "/default-avatar.png"}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-800">{friend.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleGroupSubmit}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
