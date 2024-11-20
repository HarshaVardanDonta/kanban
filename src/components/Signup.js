import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {signupUser} from '../Network/SignupAPI'

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    // Add signup logic here

    try {
        const response = await signupUser(email, password); // Call the API function
        setSuccess("Signup successful! Welcome " + response.email);
        console.log("signup success");
        setError(""); // Clear error
        navigate("/");
    } catch (err) {
        setError(err.message);
        setSuccess(""); // Clear success message
        console.log(err.message);
      }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;
