import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const LoggedInUser = ({ currentUser }) => {
  const navigate = useNavigate();

  console.log("currentUser", currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}>
      <div
        className="card p-4 shadow text-center"
        style={{ maxWidth: "400px", width: "100%" }}>
        {currentUser && (
          <>
            <h1 className="mb-4">Welcome, {currentUser.email}</h1>

            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
              <Link to="/edit-profile" className="btn btn-primary">
                Edit Profile
              </Link>
              <Link to="/privacy" className="btn btn-secondary">
                Privacy
              </Link>
              <Link to="/help" className="btn btn-info text-white">
                Help
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoggedInUser;
