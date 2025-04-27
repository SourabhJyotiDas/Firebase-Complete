import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";

const LoggedInUser = () => {
  const currentUser = useAuth();

  console.log(currentUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div>
      {currentUser ? (
        <>
          <h1>Welcome {currentUser.email}</h1>
          <button onClick={handleLogout}>Let's Logout</button>
        </>
      ) : (
        <h1>Not logged in</h1>
      )}
    </div>
  );
};

export default LoggedInUser;
