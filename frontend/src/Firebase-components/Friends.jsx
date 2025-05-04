import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, firestoreDB } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    // Try to get the user from localStorage on first load
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUID = currentUser.uid;
        const friendsRef = collection(firestoreDB, "users", currentUID, "friends");
        const snapshot = await getDocs(friendsRef);
        const friendsList = snapshot.docs.map((doc) => doc.data());
        setFriends(friendsList);
      } catch (error) {
        console.error("Error fetching friends:", error.message);
      }
    };

    fetchFriends();
  }, []);

  const handleMessage = (friendId) => {
    navigate(`/messages/${friendId}`);
  };

  return (
    <div className="container mt-5">
      {friends.length === 0 ? (
        <p className="text-center text-muted">No friends yet.</p>
      ) : (
        <ul className="list-group">
          {friends.map((friend) => (

            <li
              key={friend.uid}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <img
                  src={friend.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
                  alt="User"
                  className="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                <Link to={`/profile/${friend.uid}`} className="text-decoration-none">
                  <strong>{friend?.email.split("@")[0]}</strong>
                </Link>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleMessage(friend.uid)}
              >
                Message
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
