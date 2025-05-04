import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firestoreDB } from "../firebase";
import { Link } from "react-router-dom";

export default function FriendRequestsNotification({ currentUser }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      const requestsRef = collection(
        firestoreDB,
        "users",
        currentUser.uid,
        "friendRequests"
      );
      const snapshot = await getDocs(requestsRef);
      const reqList = [];

      for (const docSnap of snapshot.docs) {
        const fromUID = docSnap.id;
        const userRef = doc(firestoreDB, "users", fromUID);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          reqList.push({ uid: fromUID, ...userSnap.data() });
        }
      }

      setRequests(reqList);
    };

    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (user) => {
    const requesterUID = user.uid;

    // Remove the friend request
    await deleteDoc(
      doc(firestoreDB, "users", currentUser.uid, "friendRequests", requesterUID)
    );

    // Add both as friends
    await Promise.all([
      setDoc(
        doc(firestoreDB, "users", currentUser.uid, "friends", requesterUID),
        {
          uid: requesterUID,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          timestamp: new Date(),
        }
      ),
      setDoc(
        doc(firestoreDB, "users", requesterUID, "friends", currentUser.uid),
        {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          timestamp: new Date(),
        }
      ),
    ]);

    setRequests((prev) => prev.filter((r) => r.uid !== requesterUID));
  };

  if (requests.length === 0) {
    return <p className="text-center mt-4 text-muted">No friend requests.</p>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 600, margin: "0 auto" }}>
      {requests.map((user) => (
        <div
          key={user.uid}
          className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <img
              src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
              alt="profile"
              className="rounded-circle me-2"
              width="40"
              height="40"
            />
            <span>
              <Link
                to={`/profile/${user.uid}`}
                className="text-decoration-none fw-bold me-1">
                {user.displayName}
              </Link>
              wants to be your friend.
            </span>
          </div>

          <button
            className="btn btn-sm btn-success"
            onClick={() => handleAccept(user)}>
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}
