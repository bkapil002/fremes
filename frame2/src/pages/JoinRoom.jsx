import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const [inputValue, setInputValue] = useState('');
  const [linkId, setLinkId] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null); 

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!inputValue.trim()) {
      alert('Please enter a valid Room ID.');
      return;
    }

    navigate(`/room/${inputValue}`);
  };

  const handleGenerateLinkId = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user ? user.token : null;
      if (!token) {
        alert('Please log in');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'https://samzraa.onrender.com/api/agora/create-room',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLinkId(response.data.linkId);
      setRoomCreated(true);
      setInputValue(response.data.linkId);
      setRoomInfo(response.data); 
    } catch (error) {
      console.error('Error generating link ID:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // ✅ Pass room info to next page
    navigate(`/room/${inputValue}`, {
      state: {
        roomInfo,
      },
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkId);
      alert('Room ID copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Join or Create Room</h2>

        {loading && (
          <p className="text-center text-sm text-gray-500 mb-2">Creating room...</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-500 mb-2">{error}</p>
        )}

        {linkId && (
          <div className="text-center mb-4">
            <p className="mb-1">Generated Room ID:</p>
            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{linkId}</p>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 underline mt-1"
            >
              Copy Room ID
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="Enter room ID to join"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />

        <div className="flex gap-4">
          <button
            onClick={handleJoin}
            className="w-1/2 bg-blue-500 cursor-pointer text-white py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Join
          </button>
          {roomCreated ? (
            <button
              onClick={handleNext}
              className="w-1/2 bg-purple-500 cursor-pointer text-white py-2 rounded-xl hover:bg-purple-600 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerateLinkId}
              className="w-1/2 cursor-pointer bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition"
            >
              Create
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
