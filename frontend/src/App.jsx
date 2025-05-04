import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref,
  onDisconnect,
  onValue,
  serverTimestamp,
  set,
  getDatabase,
} from "firebase/database";

import { auth } from "./firebase"; // make sure to import getDatabase from your firebase config

import Signup from "./Firebase-components/Signup";
import Login from "./Firebase-components/Login";
import LoggedInUser from "./Firebase-components/LoggedInUser";
import Navbar from "./components/Navbar";
import HomePage from "./HomePage";
import EditProfile from "./Firebase-components/Edit-Profile";
import Friends from "./Firebase-components/Friends";
import MessageComponent from "./Firebase-components/MessageComponent";
import Search from "./Firebase-components/Search";
import UserProfile from "./Firebase-components/UserProfile";
import NotificationsPage from "./Firebase-components/Notification";
import ActiveUsers from "./components/ActiveUsers";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Try to get the user from localStorage on first load
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const db = getDatabase();
        const userStatusRef = ref(db, `/status/${user.uid}`);

        const isOnline = {
          status: "online",
          lastSeen: serverTimestamp(),
        };

        const isOffline = {
          status: "offline",
          lastSeen: serverTimestamp(),
        };

        onDisconnect(userStatusRef)
          .set(isOffline)
          .then(() => {
            set(userStatusRef, isOnline);
          });

        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user)); // ✅ Save to localStorage
      } else {
        setCurrentUser(null);
        localStorage.removeItem("currentUser"); // ❌ Clear if logged out
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar currentUser={currentUser} />
      <Routes>
        <Route path="/login" element={<Login currentUser={currentUser} />} />
        <Route path="/signup" element={<Signup currentUser={currentUser} />} />
        <Route
          path="/profile"
          element={<LoggedInUser currentUser={currentUser} />}
        />
        <Route
          path="/profile/edit-profile"
          element={<EditProfile currentUser={currentUser} />}
        />
        <Route
          path="/profile/friends"
          element={<Friends currentUser={currentUser} />}
        />
        <Route path="/search" element={<Search currentUser={currentUser} />} />
        <Route
          path="/profile/:userId"
          element={<UserProfile currentUser={currentUser} />}
        />
        <Route
          path="/notification"
          element={<NotificationsPage currentUser={currentUser} />}
        />
        <Route
          path="/messages"
          element={<ActiveUsers currentUser={currentUser} />}
        />
        <Route
          path="/messages/:friendId"
          element={<MessageComponent currentUser={currentUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
