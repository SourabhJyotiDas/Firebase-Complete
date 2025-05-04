import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { auth, firestoreDB } from "../firebase";

export default function UserProfile({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isIncomingRequest, setIsIncomingRequest] = useState(false);
  const [isSentRequest, setIsSentRequest] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return navigate("/login");

    const fetchData = async () => {
      const userRef = doc(firestoreDB, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser(userSnap.data());

        const friendRef = doc(
          firestoreDB,
          "users",
          currentUser.uid,
          "friends",
          userId
        );
        const friendSnap = await getDoc(friendRef);
        setIsFriend(friendSnap.exists());

        const incomingRef = doc(
          firestoreDB,
          "users",
          currentUser.uid,
          "friendRequests",
          userId
        );
        const incomingSnap = await getDoc(incomingRef);
        setIsIncomingRequest(incomingSnap.exists());

        const sentRef = doc(
          firestoreDB,
          "users",
          userId,
          "friendRequests",
          currentUser.uid
        );
        const sentSnap = await getDoc(sentRef);
        setIsSentRequest(sentSnap.exists());

        const friendDocs = await getDocs(
          collection(firestoreDB, "users", userId, "friends")
        );
        setFriendCount(friendDocs.size);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  const handleAddFriend = async () => {
    const requestRef = doc(
      firestoreDB,
      "users",
      userId,
      "friendRequests",
      currentUser.uid
    );

    if (isSentRequest) {
      // Cancel request
      await deleteDoc(requestRef);
      setIsSentRequest(false);
    } else {
      // Send request
      await setDoc(requestRef, {
        from: currentUser.uid,
        timestamp: new Date(),
        status: "pending",
      });
      setIsSentRequest(true);
    }
  };

  const handleAcceptRequest = async () => {
    await deleteDoc(
      doc(firestoreDB, "users", currentUser.uid, "friendRequests", userId)
    );

    await Promise.all([
      setDoc(doc(firestoreDB, "users", currentUser.uid, "friends", userId), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        timestamp: new Date(),
      }),
      setDoc(doc(firestoreDB, "users", userId, "friends", currentUser.uid), {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        timestamp: new Date(),
      }),
    ]);

    setIsFriend(true);
    setIsIncomingRequest(false);
    setFriendCount((prev) => prev + 1);
  };

  const handleUnfriend = async () => {
    await Promise.all([
      deleteDoc(doc(firestoreDB, "users", currentUser.uid, "friends", userId)),
      deleteDoc(doc(firestoreDB, "users", userId, "friends", currentUser.uid)),
    ]);
    setIsFriend(false);
    setFriendCount((prev) => prev - 1);
  };

  const goToMessage = () => {
    navigate(`/messages/${userId}`);
  };

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}>
        <div className="text-muted">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}>
      <div
        className="card shadow p-4"
        style={{ maxWidth: "500px", width: "100%" }}>
        <div className="d-flex align-items-center mb-3">
          <img
            src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
            alt="Profile"
            className="rounded-circle me-3"
            width="80"
            height="80"
          />
          <div>
            <h4 className="mb-1">{user.displayName}</h4>
            <p className="text-muted mb-1">{user.email}</p>
            <small>{friendCount} Friends</small>
          </div>
        </div>

        <div className="mt-3 text-center">
          {isFriend ? (
            <>
              <button
                className="btn btn-outline-danger me-2"
                onClick={handleUnfriend}>
                Unfriend
              </button>
              <button className="btn btn-primary" onClick={goToMessage}>
                Message
              </button>
            </>
          ) : isIncomingRequest ? (
            <button className="btn btn-success" onClick={handleAcceptRequest}>
              Accept Friend Request
            </button>
          ) : isSentRequest ? (
            <button className="btn btn-secondary" disabled>
              Friend Request Sent
            </button>
          ) : (
            <button
              className={`btn ${isSentRequest ? "btn-warning" : "btn-primary"}`}
              onClick={handleAddFriend}>
              {isSentRequest ? "Cancel Request" : "Send Friend Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
