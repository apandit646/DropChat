import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  MessageCircle,
  User,
  Search,
  Bell,
  Heart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const token = localStorage.getItem("token");
const socket = io("http://127.0.0.1:5000", {
  auth: { token },
  transports: ["websocket"],
  withCredentials: true,
});

const name_Person = localStorage.getItem("name");
const email_Person = localStorage.getItem("email");

// eslint-disable-next-line react/prop-types
const NavbarUser = ({ setIsLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestPop, setRequestPop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const requestRef = useRef(null);

  const navigate = useNavigate();

  const [friendRequests, setFriendRequests] = useState([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (requestRef.current && !requestRef.current.contains(event.target)) {
        setRequestPop(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (requestPop === true) {
        try {
          const res_friendRequest = await fetch(
            "http://127.0.0.1:5000/getFriendReq",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data_friendRequest = await res_friendRequest.json();
          console.log(data_friendRequest);
          setFriendRequests([...data_friendRequest]);
        } catch (error) {
          console.error("Error fetching friend requests:", error);
        }
      }
    };

    fetchFriendRequests();
  }, [requestPop]);

  useEffect(() => {
    socket.on("res_userFindemail", (data) => {
      console.log(data, "data ");
      setIsSearching(false);
      if (data === null) {
        setSearchResults([]);
      } else {
        setSearchResults(Array.isArray(data) ? data : [data]);
      }
      console.log("search results", searchResults);
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("res_userFindemail");
    };
  }, []);

  const handleAccept = async (id) => {
    console.log("Handle Accept", id);
    if (!id) {
      alert("Friend id is required");
      return;
    }
    // send put request to updating the satus of code
    await fetch("http://127.0.0.1:5000/getFriendReq/accRej", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "accepted", id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        showToast("Friend request accepted!");
      })
      .catch((error) => console.error("Error:", error));

    setFriendRequests(friendRequests.filter((request) => request._id !== id));
  };

  const handleReject = async (id) => {
    console.log("Handle Reject", id);
    if (!id) {
      alert("Friend id is required");
      return;
    }
    // send put request to updating the satus of code
    await fetch("http://127.0.0.1:5000/getFriendReq/accRej", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "rejected", id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        showToast("Friend request rejected");
      })
      .catch((error) => console.error("Error:", error));

    setFriendRequests(friendRequests.filter((request) => request._id !== id));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim() !== "") {
      setIsSearching(true);
      socket.emit("userFindemail", searchQuery);
      setShowSearchResults(true);
    }
  };

  const LogOut_User = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    socket.disconnect();
    showToast("Logged out successfully");
    navigate("/");
  };

  const request_friend = async (id) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/addFriendReq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send friend request");
      }

      showToast(data.message);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error sending friend request:", error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  // Toast notification system
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.5 }}
              className={`px-4 py-2 rounded-xl shadow-lg text-white font-medium ${
                toast.type === "error"
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-green-500 to-teal-500"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-lg"
      >
        <div className="container mx-auto">
          <div className="relative">
            {/* Decorative curved shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white opacity-5"></div>
              <div className="absolute right-20 top-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
              <div className="absolute left-1/4 -bottom-10 w-48 h-48 rounded-full bg-white opacity-5"></div>
            </div>

            {/* Main Navigation Content */}
            <div className="relative flex justify-between items-center p-4">
              <Link to="/" className="flex items-center group">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <MessageCircle
                    size={32}
                    className="mr-2 text-white group-hover:text-pink-300 transition-colors duration-300"
                  />
                </motion.div>
                <span className="hidden md:inline text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  DropChat
                </span>
              </Link>

              {/* Search Bar */}
              <div
                className="relative mx-4 flex-1 max-w-xl hidden md:block"
                ref={searchRef}
              >
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-white opacity-70">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users, chats, or messages..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-300/70 transition-all duration-300"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => {
                      if (
                        searchQuery.trim() !== "" &&
                        searchResults.length > 0
                      ) {
                        setShowSearchResults(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchClick();
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
                    onClick={handleSearchClick}
                  >
                    <Search className="text-white" size={18} />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showSearchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute mt-2 w-full bg-white rounded-xl shadow-xl py-2 text-gray-800 z-50 border border-purple-100 overflow-hidden"
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">
                            Searching...
                          </span>
                        </div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <motion.div
                            key={user._id}
                            whileHover={{ backgroundColor: "#f9f5ff" }}
                            className="px-4 py-3 cursor-pointer border-b border-purple-50 last:border-b-0 transition-all flex items-center gap-3"
                          >
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email}
                              </div>
                            </div>

                            {/* Add Friend Button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => request_friend(user._id)}
                              className="px-3 py-1.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm flex items-center gap-1 transition-all"
                            >
                              <Heart size={14} />
                              Add
                            </motion.button>
                          </motion.div>
                        ))
                      ) : (
                        // Empty State Animation
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 py-6 text-center"
                        >
                          <Search
                            size={40}
                            className="mx-auto text-purple-400 opacity-50 mb-2"
                          />
                          <p className="text-gray-500">
                            {searchQuery
                              ? "No results found"
                              : "Start typing to search for users"}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-1">
                <NavItem
                  to="/"
                  icon={<span className="text-xl">🏠</span>}
                  text="Home"
                />
                <NavItem
                  to="/chat"
                  icon={<span className="text-xl">💬</span>}
                  text="Chats"
                />
                <NavItem
                  to="/group-chat"
                  icon={<span className="text-xl">👥</span>}
                  text="Groups"
                />
                <NavItem
                  to="/news"
                  icon={<span className="text-xl">📊</span>}
                  text="News"
                />

                {/* Friend Requests */}
                <div className="relative" ref={requestRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRequestPop(!requestPop)}
                    className="flex items-center p-2 mx-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <Users size={20} />
                    {friendRequests.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                      >
                        {friendRequests.length}
                      </motion.span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {requestPop && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white text-black shadow-xl rounded-xl overflow-hidden z-10"
                      >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3">
                          <h2 className="text-lg font-semibold">
                            Friend Requests
                          </h2>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {friendRequests.length > 0 ? (
                            friendRequests.map((request) => (
                              <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 border-b border-gray-100 hover:bg-purple-50 transition-colors duration-300"
                              >
                                <div className="flex items-center mb-2">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                    {request.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium">
                                      {request.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Wants to connect
                                    </div>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAccept(request._id)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex-1 flex items-center justify-center shadow-sm"
                                  >
                                    <Heart size={14} className="mr-1" />
                                    Accept
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReject(request._id)}
                                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex-1 flex items-center justify-center shadow-sm"
                                  >
                                    <X size={14} className="mr-1" />
                                    Decline
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="py-8 px-4 text-center text-gray-500">
                              <Users
                                size={32}
                                className="mx-auto text-gray-300 mb-2"
                              />
                              <p>No friend requests</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={profileRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-2 mx-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <User size={20} />
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white text-black shadow-xl rounded-xl overflow-hidden z-10"
                      >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                              <User size={24} />
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold">{name_Person}</div>
                              <div className="text-xs opacity-80">
                                {email_Person}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <ProfileMenuItem
                            to="/chat"
                            icon={<User size={16} />}
                            text="chat"
                          />
                          <ProfileMenuItem
                            to="/news"
                            icon={<Settings size={16} />}
                            text="news"
                          />

                          <div className="border-t border-gray-200 my-1"></div>

                          <div
                            onClick={() => LogOut_User()}
                            className="flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-300 cursor-pointer"
                          >
                            <LogOut size={16} className="mr-2" />
                            <span>Logout</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-purple-700/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-3">
                <div className="relative flex items-center mb-4">
                  <div className="absolute left-3 text-white opacity-70">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:outline-none"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button
                    className="absolute right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
                    onClick={handleSearchClick}
                  >
                    <Search className="text-white" size={16} />
                  </button>
                </div>

                {/* Mobile Search Results */}
                <AnimatePresence>
                  {showSearchResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-lg mb-4 overflow-hidden text-gray-800"
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600 text-sm">
                            Searching...
                          </span>
                        </div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <div
                            key={user._id}
                            className="p-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                              <button
                                onClick={() => request_friend(user._id)}
                                className="px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 px-3 text-center text-gray-500 text-sm">
                          {searchQuery
                            ? "No results found"
                            : "Start typing to search for users"}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <MobileNavItem to="/" icon="🏠" text="Home" />
                <MobileNavItem to="/chat" icon="💬" text="Chats" />
                <MobileNavItem to="/group-chat" icon="👥" text="Group Chat" />
                <MobileNavItem to="/news" icon="📊" text="News" />

                <div
                  onClick={() => setRequestPop(!requestPop)}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-300 cursor-pointer relative"
                >
                  <div className="flex items-center">
                    <span className="w-8 text-center">👋</span>
                    <span className="ml-2">Friend Requests</span>
                  </div>
                  {friendRequests.length > 0 && (
                    <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {friendRequests.length}
                    </span>
                  )}
                </div>

                <div className="mt-4 border-t border-white/10 pt-2">
                  <div
                    onClick={() => LogOut_User()}
                    className="flex items-center py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-300 cursor-pointer"
                  >
                    <span className="w-8 text-center">🚪</span>
                    <span className="ml-2">Logout</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

// Helper Components
const NavItem = ({ to, icon, text }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-300"
    >
      <div className="mr-1">{icon}</div>
      <span>{text}</span>
    </motion.div>
  </Link>
);

const MobileNavItem = ({ to, icon, text }) => (
  <Link to={to} className="block">
    <div className="flex items-center py-3 px-2 rounded-lg hover:bg-white/10 transition-colors duration-300">
      <span className="w-8 text-center">{icon}</span>
      <span className="ml-2">{text}</span>
    </div>
  </Link>
);

const ProfileMenuItem = ({ to, icon, text }) => (
  <Link to={to} className="block">
    <div className="flex items-center px-4 py-2.5 hover:bg-indigo-50 transition-colors duration-300">
      <span className="text-gray-500 mr-2">{icon}</span>
      <span>{text}</span>
    </div>
  </Link>
);

export default NavbarUser;
