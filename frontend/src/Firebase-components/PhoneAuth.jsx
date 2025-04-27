import { useState } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function PhoneAuth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Step 1: Setup recaptcha
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('Recaptcha resolved');
      }
    });
  };

  // Step 2: Send OTP
  const sendOtp = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      console.log('OTP Sent');
    } catch (error) {
      console.error('Error during signInWithPhoneNumber', error);
    }
  };

  // Step 3: Verify OTP
  const verifyOtp = async () => {
    if (!confirmationResult) return;
    try {
      const result = await confirmationResult.confirm(otp);
      console.log('User signed in:', result.user);
    } catch (error) {
      console.error('OTP Verification Error', error);
    }
  };

  return (
    <div>
      <h1>Phone Auth</h1>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (+1234567890)" />
      <button onClick={sendOtp}>Send OTP</button>

      <br/><br/>

      <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
      <button onClick={verifyOtp}>Verify OTP</button>

      {/* Recaptcha container (hidden) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PhoneAuth;
