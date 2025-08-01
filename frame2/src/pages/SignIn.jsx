import React, { useState } from "react";

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


export default function SignIn() {
const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

 const navigate = useNavigate();
 const {login} = useAuth()
 
 const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://samzraa.onrender.com/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        login({ ...data.user, token: data.token });
        alert('Logged in successfully');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`${errorData.error}`);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error('Login attempt failed:', error.message);
    } 
  };


  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Sign In</h2>
        <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-amber-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type= 'password'
                    required
                    className="w-full px-4 py-3  bg-amber-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                </div>
              </div>
      <button className="bg-blue-600 text-white px-4 py-2" type="submit">Sign In</button>
      <Link 
          to="/signup" 
          className="block text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Don't have an account? <span className="font-medium">Sign up</span>
              </Link>
    </form>
  );
}
