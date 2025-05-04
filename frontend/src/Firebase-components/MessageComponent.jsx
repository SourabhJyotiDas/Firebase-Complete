import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getDatabase, ref, onValue, push, set } from "firebase/database"; // Correct imports for Realtime Database
import { firestoreDB } from "../firebase"; // Assuming firestoreDB is correctly exported from firebase.js

export default function MessageComponent({ currentUser }) {
  const { friendId } = useParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendData, setFriendData] = useState(null);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Generate consistent chatId
  const chatId = [currentUser.uid, friendId].sort().join("_");

  // Fetch friend's display name and photoURL from Firestore
  useEffect(() => {
    const fetchFriendData = async () => {
      const friendRef = doc(firestoreDB, "users", friendId); // Firestore document reference
      const snapshot = await getDoc(friendRef); // Fetch the document
      if (snapshot.exists()) {
        setFriendData(snapshot.data()); // Store the friend's data
      }
    };
    fetchFriendData();
  }, [friendId]);

  // Listen to chat messages from Realtime Database
  useEffect(() => {
    const messagesRef = ref(getDatabase(), `messages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setMessages([]);

      const parsed = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      parsed.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(parsed);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Listen to typing status changes from Firebase
  useEffect(() => {
    const typingRef = ref(getDatabase(), `messages/${chatId}/typingStatus`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.isTyping && data.userId !== currentUser.uid) {
        setTyping(true);
      } else {
        setTyping(false);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMessage = {
      from: currentUser.uid,
      displayName: currentUser.displayName,
      text,
      timestamp: Date.now(),
    };

    const messagesRef = ref(getDatabase(), `messages/${chatId}`);
    await push(messagesRef, newMessage); // Store the message in Realtime Database
    setText("");
    setTyping(false); // Reset typing status after sending a message
    clearTimeout(typingTimeoutRef.current); // Clear the timeout for typing status
  };

  const typingTimeoutRef = useRef(null);

  // Handle typing input changes
  const handleTyping = (e) => {
    setText(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status to true when typing starts
    updateTypingStatus(true);

    // Clear typing status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000); // 2 seconds timeout
  };

  // Update typing status in Firebase
  const updateTypingStatus = (isTyping) => {
    set(ref(getDatabase(), `messages/${chatId}/typingStatus`), {
      isTyping,
      userId: currentUser.uid,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h5 className="mb-3">
        {friendData ? (
          <span>
            <img
              src={friendData.photoURL || "https://cdn-icons-png.flaticon.com/512/11789/11789135.png"}
              alt="profile"
              className="rounded-circle me-2"
              width="30"
              height="30"
            />
            {friendData.displayName}
          </span>
        ) : (
          friendId
        )}
      </h5>

      <div
        className="border p-3 mb-3"
        style={{ height: "400px", overflowY: "auto", background: "#f5f5f5" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.from === currentUser.uid
                ? "bg-primary text-white"
                : "bg-light"
            }`}
            style={{
              maxWidth: "75%",
              marginLeft: msg.from === currentUser.uid ? "auto" : 0,
            }}>
            <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {msg.text}
            </div>

            <small
              className="text-muted d-block"
              style={{ fontSize: "0.7rem" }}>
              {msg.timestamp
                ? new Date(Number(msg.timestamp)).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </small>
          </div>
        ))}

        {typing && (
          <div className="mb-3">
            <small>
              {friendData ? friendData.displayName : "Your friend"} is typing...
            </small>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="d-flex">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          className="form-control me-2"
          placeholder="Type a message..."
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
