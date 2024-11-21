import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Network/LoginAPI';
import './Login.css';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser(email, password);
            if (response!= null) {
                localStorage.setItem("token", response['Token']);
                setUser(email);
                setSuccess("Login Successful");
                navigate("/kanban");
            } else
                setError("Invalid Email or Password");

        } catch (err) {
            setError("Invalid Email or Password");
        }
    };

    return (
        <div>
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <button type="submit">Login</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
        <p>
            Don't have an account? 
            <button onClick={()=>{
                navigate("/signup");
            }} style={{ color: 'blue', cursor: 'pointer' }}>
                Sign Up
            </button>
        </p>
    </div>
    );
};

export default Login;
