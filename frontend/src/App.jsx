import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Phone from './components/Phone';
import NavbarUser from './components/NavbarUser';
import Profile from './components/Profile';
import Chat from './components/Chat';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  

  // Sync localStorage changes with state
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', checkAuth); // Listen for changes
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <BrowserRouter>
      {isLoggedIn ? (
        <NavbarUser setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Navbar setIsLoggedIn={setIsLoggedIn} />
      )}

      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/" element={<Phone />} />

          </>
        ) : (
          <>
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat/>} />
            

          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
