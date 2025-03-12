import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, MessageCircle, User, Search, Bell } from "lucide-react";
import io from "socket.io-client";

const token = localStorage.getItem("token");
const socket = io("http://127.0.0.1:5000", {
  auth: { token },
  transports: ["websocket"],
  withCredentials: true,
});

const NavbarUser = ({ setIsLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestPop, setRequestPop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  const [friendRequests, setFriendRequests] = useState([]);
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
      if (data === null) return setSearchResults(null);
      setSearchResults(data);
      console.log(searchResults, "search results");
    });
  }, [setSearchQuery, searchResults]);

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
        alert(`frind request accpet `);
      })
      .catch((error) => console.error("Error:", error));

    alert("Accept", id);
  };

  const handleReject = async (id) => {
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
      body: JSON.stringify({ status: "rejected", id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert(`frind request rejected `);
      })
      .catch((error) => console.error("Error:", error));

    alert("rejected");
    // socket.emit("acceptFriendRequest", id);
    setFriendRequests(friendRequests.filter((request) => request.id !== id));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchClick = () => {
    socket.emit("userFindemail", searchQuery);
    setShowSearchResults(true);
  };

  const LogOut_User = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    socket.disconnect();
    navigate("/");
  };

  const request_friend = async (id) => {
    try {
      alert(`Friend ${id}`);

      const res = await fetch("http://127.0.0.1:5000/addFriendReq", {
        // Fixed fetch syntax
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass token in the Authorization header
        },
        body: JSON.stringify({ id }), // Send id in request body
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send friend request");
      }

      alert(`${data.message}`); // showling message that frind is already resy or doe n
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold flex items-center hover:text-purple-200 transition-colors duration-300"
        >
          <MessageCircle size={28} className="mr-2" />
          <span className="hidden md:inline">ChatApp</span>
        </Link>

        <div
          className="relative mx-4 flex-1 max-w-xl hidden md:block"
          ref={searchRef}
        >
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search users, chats, or messages..."
              className="w-full px-4 py-2 rounded-l-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowSearchResults(true)}
            />
            {/* Button next to the input */}
            <button
              className="px-4 py-2 rounded-r-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300"
              onClick={handleSearchClick}
            >
              <Search className="text-white" size={20} />
            </button>
          </div>

          {showSearchResults && searchResults?.length > 0 && (
            <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg py-2 text-gray-800 z-50">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center">
                    <User size={16} className="mr-2 text-blue-600" />
                    <span>{result.name}</span>
                    <button
                      onClick={() => request_friend(result._id)}
                      className="ml-auto  text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Green
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearchResults &&
            (searchResults === null || searchResults?.length === 0) && (
              <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg py-2 text-gray-800 z-50">
                <div className="px-4 py-2 text-center text-gray-500">
                  No results found
                </div>
              </div>
            )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <ul
          className={`md:flex md:space-x-6 absolute md:static top-16 left-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 md:w-auto md:bg-transparent md:flex-row flex-col items-center transition-all duration-300 ease-in-out ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <li>
            <Link
              to="/"
              className="flex items-center px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300"
            >
              🏠 <span className="ml-2">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/chat"
              className="flex items-center px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300"
            >
              💬 <span className="ml-2">Chats</span>
            </Link>
          </li>
          <li>
            <Link
              to="/status"
              className="flex items-center px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300"
            >
              📊 <span className="ml-2">Status</span>
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => setRequestPop(!requestPop)}
              className="flex items-center px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300"
            >
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
              + Request
            </button>
            {requestPop && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white text-black shadow-lg rounded-lg py-2 z-10">
                <h2 className="text-xl font-bold mb-2 px-4">Friend Requests</h2>
                {friendRequests.length > 0 ? (
                  friendRequests.map((request) => (
                    <div
                      key={request._id}
                      className="px-4 py-2 hover:bg-gray-50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{request.name}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleAccept(request._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600 transition-colors duration-300"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors duration-300"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2 text-gray-500">No friend requests</p>
                )}
              </div>
            )}
          </li>
        </ul>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <User size={24} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg py-2 z-10">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
              >
                👤 <span className="ml-2">Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
              >
                ⚙️ <span className="ml-2">Settings</span>
              </Link>
              <Link
                to="/contacts"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
              >
                📞 <span className="ml-2">Contacts</span>
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <Link
                onClick={() => LogOut_User()}
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-300 text-red-600"
              >
                🚪 <span className="ml-2">Logout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
