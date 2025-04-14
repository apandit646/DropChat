import { useState, useEffect, useRef } from "react";
import { Send, Users, Search, X, Plus, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import image from "../img/group.png";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("name");
import GroupMembersPopup from "../common/GroupMembersPopup";
const profileUrl = localStorage.getItem("photo") || image;

const GroupChat = () => {
  const [socket, setSocket] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isGroupFormVisible, setIsGroupFormVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // users pops
  const messagesEndRef = useRef(null);

  // Fetch Friends for Group Creation
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
  }, [newMessage, selectedGroup, setNewMessage, setMessages]);
  // Fetch Groups List
  async function getGroupsList() {
    try {
      const res = await fetch("http://127.0.0.1:5000/getFriendGroupList", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("fetching group data with sorthed arry and count : 🧵", data);
      if (Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }
  useEffect(() => {
    getGroupsList();
  }, []);

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
  }, []);

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

  // Fetch Group Messages when Group is Selected
  const getChatMessages = async (group) => {
    setSelectedGroup(group);
    if (isMobileView) {
      setShowSidebar(false);
    }
    // socket.emit("joinGroup", group._id);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/chatGroupMessages?receiver=${group._id}`,
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
        sender: msg.sender._id, // Changed from msg.sender to msg.sender._id
        senderName: msg.sender.name,
        profileUrlPhoto: msg.sender.photo, // Add sender name for display
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        _id: msg._id,
      }));

      const unReadMessage = data.filter((msg) =>
        msg.status?.some((entry) => entry.userId === userId)
      );

      console.log(unReadMessage, "Filtered messages where user has status");

      const unreadCount = unReadMessage.length;
      if (unreadCount > 0) {
        await socket.emit("markAsReadMessage", {
          unRead: unReadMessage.map((msg) => msg._id),
        });
      }
      setGroupName([...groupName], (group.deliveredCount = 0));

      setMessages(transformedMessages); // Moved outside the if block
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Listen for Incoming Messages via Socket
  useEffect(() => {
    if (!socket) return;

    const messageHandler = async (serverMsg) => {
      if (!serverMsg || !serverMsg._id) return; // Ensure message is valid
      await getGroupsList();
      console.log(serverMsg, "Received New message from server");

      const transformedMsg = {
        text: serverMsg.message || "No message",
        sender: serverMsg.sender._id, // Changed from serverMsg.sender
        senderName: serverMsg.sender.name,
        profileUrlPhoto: serverMsg.sender.photo,
        group: serverMsg.group, // Add sender name
        timestamp: serverMsg.createdAt
          ? new Date(serverMsg.createdAt).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        _id: serverMsg._id,
      };

      setMessages((prev) => {
        // Prevent duplicates based on `_id`
        if (prev.some((msg) => msg._id === transformedMsg._id)) return prev;
        return [...prev, transformedMsg];
      });
    };

    socket.on("messageGroup", messageHandler);

    return () => {
      socket.off("messageGroup", messageHandler);
    };
  }, [socket]);

  // sendig groupid to backend
  useEffect(() => {
    if (!socket || groups.length === 0) return;

    groups.forEach((group) => {
      socket.emit("joinGroup", group._id);
    });

    console.log(
      "Sent group IDs to server:",
      groups.map((g) => g._id)
    );
  }, [socket, groups]);

  // Send Message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup || !socket) return;

    socket.emit("sendGroupMessage", {
      sender: userId,
      group: selectedGroup._id,
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
    console.log(friend, "Selected Friend for Group Creation");
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
      getGroupsList();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // Filter groups based on search query
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for message timestamps
  const formatTimestamp = (timestamp) => {
    return (
      timestamp ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // add member to group
  const addMemberToGroup = async (groupId, memberId) => {
    console.log(groupId, memberId, "Group ID and Member ID to add");
    try {
      socket
        .emit("addMemberToGroup", {
          groupId,
          members: memberId.map((id) => ({
            userId: id._id,
          })),
        })
        .then((data) => {
          console.log(data, "Added member to group successfully");
        });
    } catch (error) {
      console.error("Error adding member to group:", error);
    }
  };
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar - only render when visible */}
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
                {isMobileView && (
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search groups..."
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

            {/* Create Group Button */}
            <button
              onClick={handleCreateGroup}
              className="mx-4 my-3 px-4 py-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              <span className="font-medium">Create New Group</span>
            </button>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 bg-indigo-50">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-medium text-indigo-700 text-sm">
                    GROUPS ({filteredGroups.length})
                  </h3>
                </div>
              </div>

              {filteredGroups.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No groups found
                </div>
              ) : (
                <div>
                  {filteredGroups.map((group) => (
                    <div
                      key={group._id}
                      onClick={() => getChatMessages(group)}
                      className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-indigo-50 transition-colors border-l-4 ${
                        selectedGroup?._id === group._id
                          ? "border-l-indigo-500 bg-indigo-50"
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={image}
                          alt={group.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">
                            {group.name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            12:30 PM
                          </span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                          <p className="text-sm text-gray-600 truncate max-w-[12rem]">
                            {messages.find((m) => m.group === group._id)
                              ?.text || (
                              <span className="italic text-gray-400">
                                Start a conversation
                              </span>
                            )}
                          </p>

                          {group.deliveredCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-indigo-500 rounded-full shadow-sm">
                              {group.deliveredCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {isMobileView && !showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}

                <div className="relative">
                  <img
                    src={image}
                    alt={selectedGroup.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {selectedGroup.name}
                  </h2>
                  <span className="text-xs text-green-500">
                    {selectedGroup.members?.length || 0} members
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setShowPopup((prev) => !prev)}
                >
                  <Users size={20} />
                </button>

                {showPopup && (
                  <GroupMembersPopup
                    members={selectedGroup.members}
                    onAddMember={(filteredFriends) => {
                      addMemberToGroup(selectedGroup._id, filteredFriends);
                    }}
                    friends={friends}
                    groupId={selectedGroup._id}
                    onClose={() => setShowPopup(false)}
                  />
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50"
              id="messages-container"
            >
              {messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.sender === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender !== userId && (
                    <div className="flex flex-col items-center mr-2 self-end mb-2">
                      <img
                        src={message.profileUrlPhoto || image}
                        alt="Member"
                        className="w-8 h-8 rounded-full"
                      />
                      <p className="text-xs text-gray-500">
                        {message.senderName}
                      </p>
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                      message.sender === userId
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === userId
                          ? "text-indigo-100"
                          : "text-gray-400"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.sender === userId && (
                    <div className="flex flex-col items-center ml-2 self-end mb-2">
                      <img
                        src={profileUrl || image}
                        alt="You"
                        className="w-8 h-8 rounded-full"
                      />
                      <p className="text-xs text-black">(You)</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-md">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 rounded-xl bg-white bg-opacity-60 backdrop-blur-sm shadow-lg">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-indigo-700 mb-2">
                Group Conversations
              </h2>
              <p className="text-gray-600 max-w-xs mx-auto">
                Select a group from the list or create a new group to start
                chatting
              </p>

              {isMobileView && !showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg"
                >
                  View Groups List
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Group Creation Modal */}
      {isGroupFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md m-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-indigo-800">
                Create New Group
              </h2>
              <button
                onClick={() => setIsGroupFormVisible(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Group Name Input */}
            <div className="mb-6">
              <label
                htmlFor="group-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Group Name
              </label>
              <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={handleGroupNameChange}
                placeholder="Enter a name for your group"
                className="w-full p-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
              />
            </div>

            {/* Select Members */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Members
              </label>
              <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-2">
                {friends.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No friends found
                  </p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-indigo-50"
                      onClick={() => handleMemberSelection(friend)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend._id)}
                        onChange={() => handleMemberSelection(friend)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="relative flex-shrink-0">
                        <img
                          src={image}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {friend.name}
                        </h3>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {selectedMembers.length} members selected
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsGroupFormVisible(false)}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGroupSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={!groupName || selectedMembers.length === 0}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
