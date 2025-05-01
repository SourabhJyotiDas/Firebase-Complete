import Signup from "./Firebase-components/Signup";
import Login from "./Firebase-components/Login";
import LoggedInUser from "./Firebase-components/LoggedInUser";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import HomePage from "./HomePage";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Navbar currentUser={currentUser}/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login currentUser={currentUser} />} />
          <Route
            path="/signup"
            element={<Signup currentUser={currentUser} />}
          />
          <Route
            path="/profile"
            element={<LoggedInUser currentUser={currentUser} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
