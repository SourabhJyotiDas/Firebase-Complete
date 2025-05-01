import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, firestoreDB } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login({ currentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to handle error messages
  const navigate = useNavigate();

  // If the user is already logged in, redirect to profile page
  // If currentUser is not provided, navigate to the login page
  useEffect(() => {
    if (currentUser) {
      navigate("/profile");
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    setError(""); // Reset error on every attempt
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in user:", userCredential.user);
      navigate("/profile"); // Redirect after successful login
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message); // Set error message for display
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Reference to the user's document in Firestore
      const userRef = doc(firestoreDB, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Only create the document if it doesn't exist
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
      }

      console.log("Google signed up user:", user.uid);
      navigate("/profile");
    } catch (error) {
      console.error("Google signup error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}>
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "400px", width: "100%" }}>
        <h1 className="text-center mb-4">Login</h1>

        {/* Display error message if any */}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={handleLogin}>
          Login
        </button>

        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
          onClick={handleGoogleLogin}>
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p className="text-center">
          New user? <Link to="/signup">Signup here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
