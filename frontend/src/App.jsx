import { ref, set } from "firebase/database";
import { db } from "./firebase";
import ReadData from "./read-data";

function App() {
  const handleWrite = async () => {
    try {
      await set(ref(db, "users/123"), {
        _id: Math.random(0.6),
        username: "JohnDoe 2",
        email: "johndoe@example.com",
        profile_picture: "some-url.jpg",
      });
      console.log("Data written successfully!");
    } catch (error) {
      console.error("Error writing data:", error);
    }
  };

  return (
    <>
      <button onClick={handleWrite}>Write Data</button>

      <ReadData />
    </>
  );
}

export default App;
