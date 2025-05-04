import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, onValue, getDatabase } from "firebase/database";
import { auth, firestoreDB } from "../firebase";
import { Link } from "react-router-dom";

const ActiveFriendsList = () => {
  const [friends, setFriends] = useState([]);


  const [currentUser, setCurrentUser] = useState(() => {
    // Try to get the user from localStorage on first load
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUID = currentUser.uid;
        const friendsRef = collection(
          firestoreDB,
          "users",
          currentUID,
          "friends"
        );
        const snapshot = await getDocs(friendsRef);
        const friendsList = snapshot.docs.map((doc) => doc.data());

        const detailedFriends = await Promise.all(
          friendsList.map(async (friend) => {
            const fullDoc = await getDoc(doc(firestoreDB, "users", friend.uid));
            return { ...friend, ...fullDoc.data(), uid: friend.uid };
          })
        );

        // Now add real-time status from Realtime Database
        const db = getDatabase();
        const updatedFriends = detailedFriends.map((friend) => {
          const statusRef = ref(db, `/status/${friend.uid}`);
          onValue(statusRef, (snapshot) => {
            const statusData = snapshot.val();
            setFriends((prevFriends) =>
              prevFriends.map((f) =>
                f.uid === friend.uid
                  ? {
                      ...f,
                      status: statusData?.status,
                      lastSeen: statusData?.lastSeen,
                    }
                  : f
              )
            );
          });

          return friend;
        });

        setFriends(updatedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error.message);
      }
    };

    fetchFriends();
  }, []);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen: Unknown";

    const last =
      typeof timestamp === "number"
        ? new Date(timestamp)
        : timestamp.toDate?.() ?? new Date(timestamp); // fallback handling

    if (isNaN(last)) return "Last seen: Unknown";

    const now = new Date();
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins} min ago`;
    if (diffHrs < 24) return `Last seen ${diffHrs} hr ago`;
    return `Last seen on ${last.toLocaleDateString()} at ${last.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;
  };

  return (
    <div className="container mt-5">
      {friends.length === 0 ? (
        <p className="text-center text-muted">No friends found.</p>
      ) : (
        <ul className="list-group">
          {friends.map((friend) => (
            <li
              key={friend.uid}
              className="list-group-item d-flex justify-content-between align-items-center">
              <Link
                to={`/messages/${friend.uid}`}
                className="d-flex align-items-center text-decoration-none">
                <div className="position-relative me-3">
                  <img
                    src={friend.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
                    alt="User"
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                </div>
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center">
                    <strong>{friend.email?.split("@")[0] || "Unknown"}</strong>
                    {friend.status === "online" && (
                      <span
                        className="ms-2 p-1 bg-success border border-light rounded-circle"
                        style={{ width: 10, height: 10 }}
                      />
                    )}
                  </div>
                  <small className="text-muted">
                    {friend.status === "online"
                      ? "Online"
                      : formatLastSeen(friend.lastSeen)}
                  </small>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveFriendsList;
