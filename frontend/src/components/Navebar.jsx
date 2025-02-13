import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {LogIn, UserPlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
const Navebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleRouteChange = (link) => {
    navigate(link);
    setIsOpen(false);
  };

  const navItems = [
    { icon: <UserPlus className="w-5 h-5" />, label: 'Signup', link: '/' },
    { icon: <LogIn className="w-5 h-5" />, label: 'Login', link: '/login' }
  ];

  // Animation variants (same as previous code)
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between h-16"
        >
          {/* Logo or Brand */}
          <Link to="/">
            <motion.div 
              variants={itemVariants}
              className="flex items-center"
            >
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="text-white text-2xl font-bold cursor-pointer"
              >
                🚀 UserPro 🚀
              </motion.span>
            </motion.div>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleNavbar}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Desktop Navigation */}
          <motion.div 
            variants={containerVariants}
            className="hidden md:block"
          >
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRouteChange(item.link)}
                  className="text-white hover:bg-blue-700 hover:text-white 
                    px-3 py-2 rounded-md flex items-center space-x-2 
                    transition duration-300 ease-in-out"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRouteChange(item.link)}
                    className="text-white hover:bg-blue-700 hover:text-white 
                      block px-3 py-2 rounded-md w-full text-left 
                      flex items-center space-x-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navebar;