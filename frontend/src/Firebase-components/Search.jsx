import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { firestoreDB, auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import UserLists from "../components/UserLists";

export default function Search({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [incomingRequests, setIncomingRequests] = useState({});
  const [friends, setFriends] = useState({});
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUID = currentUser.uid;

      // Friends
      const friendsSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friends")
      );
      const friendMap = {};
      friendsSnap.forEach((doc) => {
        friendMap[doc.id] = true;
      });
      setFriends(friendMap);

      // Incoming friend requests
      const incomingSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friendRequests")
      );
      const incomingMap = {};
      incomingSnap.forEach((doc) => {
        incomingMap[doc.id] = true;
      });
      setIncomingRequests(incomingMap);

      // All users
      const allUsersSnap = await getDocs(collection(firestoreDB, "users"));
      const fetchedUsers = [];

      for (const userDoc of allUsersSnap.docs) {
        const data = userDoc.data();
        if (data.uid === currentUID) continue;

        fetchedUsers.push(data);

        const reqSnap = await getDoc(
          doc(firestoreDB, "users", data.uid, "friendRequests", currentUID)
        );
        setSentRequests((prev) => ({
          ...prev,
          [data.uid]: reqSnap.exists(),
        }));
      }

      setUsers(fetchedUsers);
    };

    fetchData();
  }, [currentUser]);

  const handleButtonClick = async (user) => {
    const currentUID = currentUser.uid;
    const isIncoming = incomingRequests[user.uid];
    const isSent = sentRequests[user.uid];

    try {
      if (isIncoming) {
        // Accept friend request
        await deleteDoc(
          doc(firestoreDB, "users", currentUID, "friendRequests", user.uid)
        );

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
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL || "",
            timestamp: new Date(),
          }),
        ]);

        setIncomingRequests((prev) => ({
          ...prev,
          [user.uid]: false,
        }));
        setFriends((prev) => ({
          ...prev,
          [user.uid]: true,
        }));
      } else if (isSent) {
        // Cancel sent request
        await deleteDoc(
          doc(firestoreDB, "users", user.uid, "friendRequests", currentUID)
        );
        setSentRequests((prev) => ({
          ...prev,
          [user.uid]: false,
        }));
      } else {
        // Send new request
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
      console.error("Error handling friend request:", err.message);
    }
  };

  const filteredUsers =
    search.trim() === ""
      ? []
      : users.filter((u) =>
          u.displayName?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <>
      <div className="container mt-5">
        <input
          type="text"
          placeholder="Search by name..."
          className="form-control mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul className="list-group">
          {filteredUsers.map((user) => {
            const isFriend = friends[user.uid];
            const isIncoming = incomingRequests[user.uid];
            const isSent = sentRequests[user.uid];

            let buttonText = "";
            if (isIncoming) buttonText = "Accept Request";
            else if (isSent) buttonText = "Cancel Request";
            else buttonText = "Send Friend Request";

            return (
              <li
                key={user.uid}
                className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
                    alt="User"
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <Link
                      to={`/profile/${user.uid}`}
                      className="fw-bold d-block">
                      {user.displayName}
                    </Link>
                    <small className="text-muted">{user.email}</small>
                  </div>
                </div>

                {!isFriend && (
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
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <UserLists currentUser={currentUser}/>
    </>
  );
}
