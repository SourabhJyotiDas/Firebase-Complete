// src/pages/ReadData.jsx
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";

function ReadData() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userRef = ref(db, 'users/123');

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUser(data);
      } else {
        console.log("No data available");
      }
    });

    return () => unsubscribe(); // optional clean-up
  }, []);

  return (
    <div>
      <h1>User Data</h1>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ReadData;
