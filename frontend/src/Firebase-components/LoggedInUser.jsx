import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const LoggedInUser = ({ currentUser }) => {
  const navigate = useNavigate();

  // If currentUser is not provided, navigate to the login page
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card p-4 shadow text-center"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        {currentUser && (
          <>
            <h1 className="mb-4">Welcome, {currentUser.displayName || currentUser.email}</h1>

            {/* Profile Photo Section */}
            <div className="d-flex justify-content-center mb-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    border: "3px solid #007bff", // Optional border for style
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "150px",
                    height: "150px",
                    backgroundColor: "#ddd",
                  }}
                >
                  <i className="fas fa-user" style={{ fontSize: "50px", color: "#fff" }}></i>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="d-grid gap-2 mb-3">
            
              <Link to="/profile/edit-profile" className="btn btn-primary">
                Edit Profile
              </Link>
              <Link to="/profile/friends" className="btn btn-secondary">
                Friends
              </Link>
              <Link to="/privacy" className="btn btn-secondary">
                Privacy
              </Link>
              <Link to="/help" className="btn btn-info text-white">
                Help
              </Link>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoggedInUser;
