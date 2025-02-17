import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MessageCircle, User } from "lucide-react";

const NavbarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestPop, setRequestPop] = useState(false);

  // Dummy friend request data
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alice Johnson" },
    { id: 4, name: "Bob Williams" },
    { id: 5, name: "Charlie Brown" },
    { id: 6, name: "David Lee" },
  ]);

  const handleAccept = (id) => {
    alert(`Accepted request from ${friendRequests.find(req => req.id === id).name}`);
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  const handleReject = (id) => {
    alert(`Rejected request from ${friendRequests.find(req => req.id === id).name}`);
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center hover:text-purple-200 transition-colors duration-300">
          <MessageCircle size={28} className="mr-2" /> ChatApp
        </Link>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <ul className={`md:flex md:space-x-6 absolute md:static top-16 left-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 md:w-auto md:bg-transparent md:flex-row flex-col items-center transition-transform duration-300 ease-in-out ${isOpen ? "block" : "hidden"}`}>
          <li><Link to="/" className="block px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300">🏠 Home</Link></li>
          <li><Link to="/chat" className="block px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300">💬 Chats</Link></li>
          <li><Link to="/status" className="block px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300">📊 Status</Link></li>
          <li onClick={() => setRequestPop(!requestPop)} className="block px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300 cursor-pointer relative">+ Request
            {requestPop && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black shadow-lg rounded-md py-2 z-10">
                <h2 className="text-xl font-bold mb-2 px-4">Friend Requests</h2>
                {friendRequests.length > 0 ? (
                  friendRequests.map((request) => (
                    <div key={request.id} className="flex justify-between items-center px-4 py-2 border-b">
                      <span>{request.name}</span>
                      <div className="space-x-2">
                        <button onClick={() => handleAccept(request.id)} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                        <button onClick={() => handleReject(request.id)} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2">No friend requests</p>
                )}
              </div>
            )}
          </li>
          <li><Link to="/news" className="block px-4 py-2 md:px-0 hover:text-purple-200 transition-colors duration-300">📰 News</Link></li>
        </ul>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            <User size={24} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md py-2">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200 transition-colors duration-300">👤 Profile</Link>
              <Link to="/settings" className="block px-4 py-2 hover:bg-gray-200 transition-colors duration-300">⚙️ Settings</Link>
              <Link to="/contacts" className="block px-4 py-2 hover:bg-gray-200 transition-colors duration-300">📞 Contacts</Link>
              <Link to="/logout" className="block px-4 py-2 hover:bg-gray-200 transition-colors duration-300">🚪 Logout</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
