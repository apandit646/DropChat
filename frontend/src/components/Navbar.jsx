import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Phone, Info } from "lucide-react";

const Navbar = ({ setIsLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate("/login");
  };

  const menuItems = [{ label: "login", icon: <Home size={20} />, path: "/" }];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Logo
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center">
            <div className="ml-4 flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
              >
                <User size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User size={20} />
              <span className="ml-2">Profile</span>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
