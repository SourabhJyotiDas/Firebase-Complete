import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, firestoreDB } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUID = auth.currentUser.uid;
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
      <h3 className="text-center mb-4">Your Friends</h3>
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
                  src={friend.photoURL || "https://via.placeholder.com/40"}
                  alt="User"
                  className="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                <Link to={`/profile/${friend.uid}`} className="text-decoration-none">
                  <strong>{friend.displayName}</strong>
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
