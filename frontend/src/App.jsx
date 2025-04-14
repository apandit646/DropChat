import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Phone from "./components/Phone";
import NavbarUser from "./components/NavbarUser";

import Chat from "./components/Chat";
import News from "./components/News";
import HomePage from "./components/HomePage";
import GroupChat from "./components/GrpupChat";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Sync localStorage changes with state
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth); // Listen for changes
    return () => window.removeEventListener("storage", checkAuth);
  }, [setIsLoggedIn, isLoggedIn]);

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
            <Route path="/" element={<Phone setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/group-chat" element={<GroupChat />} />
            <Route path="*" element={<Navigate to="/home" />} />
            <Route path="/news*" element={<News />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
