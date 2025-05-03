import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { auth, firestoreDB } from "../firebase";
import { Link } from "react-router-dom"; // <-- Import Link
import { useNavigate } from "react-router-dom";

const UserLists = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [incomingRequests, setIncomingRequests] = useState({});
  const [friends, setFriends] = useState({});

  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const currentUID = currentUser.uid;

      // 1. Get current user's friends
      const friendsSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friends")
      );
      const friendMap = {};
      friendsSnap.forEach((doc) => {
        friendMap[doc.id] = true; // friend UID
      });
      setFriends(friendMap);

      // 2. Get incoming friend requests
      const incomingSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friendRequests")
      );
      const incomingMap = {};
      incomingSnap.forEach((doc) => {
        incomingMap[doc.id] = true;
      });
      setIncomingRequests(incomingMap);

      // 3. Get all users (excluding self and friends)
      const allUsersSnap = await getDocs(collection(firestoreDB, "users"));
      const filteredUsers = [];

      for (const userDoc of allUsersSnap.docs) {
        const data = userDoc.data();
        if (
          data.uid !== currentUID &&
          !friendMap[data.uid] // Exclude friends
        ) {
          filteredUsers.push({ ...data, id: userDoc.id });

          // Check if I sent them a request
          const reqSnap = await getDoc(
            doc(firestoreDB, "users", data.uid, "friendRequests", currentUID)
          );
          setSentRequests((prev) => ({
            ...prev,
            [data.uid]: reqSnap.exists(),
          }));
        }
      }

      setUsers(filteredUsers);
    };

    fetchUsers();
  }, []);

  const handleButtonClick = async (user) => {
    const currentUID = auth.currentUser.uid;
    const isIncoming = incomingRequests[user.uid];
    const isSent = sentRequests[user.uid];

    try {
      if (isIncoming) {
        // Accept Request
        await deleteDoc(
          doc(firestoreDB, "users", currentUID, "friendRequests", user.uid)
        );

        // Add each other as friends
        await Promise.all([
          setDoc(doc(firestoreDB, "users", currentUID, "friends", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL || "",
            timestamp: new Date(),
          }),
          setDoc(doc(firestoreDB, "users", user.uid, "friends", currentUID), {
            uid: currentUID,
            displayName: auth.currentUser.displayName,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL || "",
            timestamp: new Date(),
          }),
        ]);

        // Update state
        setIncomingRequests((prev) => ({
          ...prev,
          [user.uid]: false,
        }));
        setFriends((prev) => ({
          ...prev,
          [user.uid]: true,
        }));
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid)); // remove from list
      } else if (isSent) {
        // Cancel Sent Request
        await deleteDoc(
          doc(firestoreDB, "users", user.uid, "friendRequests", currentUID)
        );
        setSentRequests((prev) => ({
          ...prev,
          [user.uid]: false,
        }));
      } else {
        // Send New Request
        await setDoc(
          doc(firestoreDB, "users", user.uid, "friendRequests", currentUID),
          {
            from: currentUID,
            timestamp: new Date(),
            status: "pending",
          }
        );
        setSentRequests((prev) => ({
          ...prev,
          [user.uid]: true,
        }));
      }
    } catch (err) {
      console.error("Error handling request:", err.message);
    }
  };

  return (
    <div className="container mt-5">
      <ul className="list-group">
        {users.map((user) => {
          const isIncoming = incomingRequests[user.uid];
          const isSent = sentRequests[user.uid];
          const buttonText = isIncoming
            ? "Accept Request"
            : isSent
            ? "Cancel Request"
            : "Send Friend Request";

          return (
            <li
              key={user.uid}
              className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt="User"
                  className="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                {/* Add Link to profile */}
                <Link
                  to={`/profile/${user.uid}`}
                  className="text-decoration-none">
                  <strong>{user?.displayName}</strong>
                </Link>
              </div>
              <button
                className={`btn ${
                  isIncoming
                    ? "btn-success"
                    : isSent
                    ? "btn-secondary"
                    : "btn-primary"
                }`}
                onClick={() => handleButtonClick(user)}>
                {buttonText}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserLists;
