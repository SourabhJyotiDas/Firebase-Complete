// src/pages/WriteData.jsx
import { db } from "../firebase";
import { ref, set } from "firebase/database";

function WriteData() {
  const handleWrite = async () => {
    try {
      await set(ref(db, 'users/123'), {
        username: "JohnDoe",
        email: "johndoe@example.com",
        profile_picture : "some-url.jpg"
      });
      console.log("Data written successfully!");
    } catch (error) {
      console.error("Error writing data:", error);
    }
  };

  return <button onClick={handleWrite}>Write Data</button>;
}

export default WriteData;
