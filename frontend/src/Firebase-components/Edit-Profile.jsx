import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestoreDB } from "../firebase";
import { updateProfile } from "firebase/auth";


const EditProfile = ({ currentUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userRef = doc(firestoreDB, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setName(userData.displayName || "");
            setEmail(userData.email || "");
          }
        } catch (err) {
          setError("Failed to load user data.");
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleNameChange = (e) => setName(e.target.value);

  const handleProfileUpdate = async () => {
   setError("");
   try {
     // Update Firebase Auth
     await updateProfile(currentUser, { displayName: name });
 
     // Update Firestore
     await updateDoc(doc(firestoreDB, "users", currentUser.uid), {
       displayName: name,
     });
 
     navigate("/profile");
   } catch (err) {
     setError("Error updating name: " + err.message);
   }
 };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Update Name</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    disabled
                  />
                </div>

                <div className="mt-3 d-flex justify-content-center">
                  <button className="btn btn-primary" onClick={handleProfileUpdate}>
                    Update Name
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
