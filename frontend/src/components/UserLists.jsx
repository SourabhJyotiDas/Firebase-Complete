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
import { Link, useNavigate } from "react-router-dom";

const UserLists = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [incomingRequests, setIncomingRequests] = useState({});
  const [friends, setFriends] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const currentUID = currentUser.uid;

      const friendsSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friends")
      );
      const friendMap = {};
      friendsSnap.forEach((doc) => {
        friendMap[doc.id] = true;
      });
      setFriends(friendMap);

      const incomingSnap = await getDocs(
        collection(firestoreDB, "users", currentUID, "friendRequests")
      );
      const incomingMap = {};
      incomingSnap.forEach((doc) => {
        incomingMap[doc.id] = true;
      });
      setIncomingRequests(incomingMap);

      const allUsersSnap = await getDocs(collection(firestoreDB, "users"));
      const filteredUsers = [];

      for (const userDoc of allUsersSnap.docs) {
        const data = userDoc.data();
        if (data.uid !== currentUID && !friendMap[data.uid]) {
          filteredUsers.push({ ...data, id: userDoc.id });

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
            displayName: auth.currentUser.displayName,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL || "",
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
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      } else if (isSent) {
        await deleteDoc(
          doc(firestoreDB, "users", user.uid, "friendRequests", currentUID)
        );
        setSentRequests((prev) => ({
          ...prev,
          [user.uid]: false,
        }));
      } else {
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
    <div className="container mt-4">
      <h3 className="mb-3">Discover People</h3>
      <div
        className="d-flex overflow-auto gap-3 py-2 px-1"
        style={{ whiteSpace: "nowrap" }}
      >
        {users.map((user) => {
          const isIncoming = incomingRequests[user.uid];
          const isSent = sentRequests[user.uid];
          const buttonText = isIncoming
            ? "Accept"
            : isSent
            ? "Cancel"
            : "Add Friend";

          const buttonClass = isIncoming
            ? "btn-success"
            : isSent
            ? "btn-secondary"
            : "btn-primary";

          return (
            <div
              key={user.uid}
              className="card text-center shadow-sm"
              style={{ minWidth: "200px" }}
            >
              <div className="card-body">
                <img
                  src={user.photoURL || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStt6mFXAUq2EJs2B9fmWG2GI-iS1gMwHAAsQ&s"}
                  alt={user.displayName}
                  className="rounded-circle mb-2"
                  width="80"
                  height="80"
                  style={{ objectFit: "cover" }}
                />
                <h6 className="card-title mb-0">
                  <Link to={`/profile/${user.uid}`} className="text-decoration-none">
                    {user.displayName}
                  </Link>
                </h6>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                  {user.email}
                </p>
                <button
                  className={`btn btn-sm ${buttonClass}`}
                  onClick={() => handleButtonClick(user)}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserLists;
