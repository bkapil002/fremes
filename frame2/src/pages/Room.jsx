import React, { useState, useEffect } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor,
} from "lucide-react";

import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
  useRTCClient,
} from "agora-rtc-react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Room = () => {
  const { linkId } = useParams();
  const { user } = useAuth();
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [showSidebar, setShowSidebar] = useState(false);

  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const [email, setEmail] = useState("");

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);
  const [admin, setAdmin] = useState('');

  const client = useRTCClient();
  const isAdmin = email === admin;

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isAdmin && micOn);
  const { localCameraTrack } = useLocalCameraTrack(isAdmin && cameraOn);

  // Names mapping for remote users (uid => name)
  const [names, setNames] = useState({});

  useEffect(() => {
    if (!user || !linkId) return;

    const fetchRoomDetails = async () => {
      try {
        const response = await axios.put(
          `https://samzraa.onrender.com/api/agora/join-room/${linkId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = response.data;
        setToken(data.agora.token);
        setChannel(data.agora.channelName);
        setAppId(data.agora.appId);
        setEmail(user.email);
        setAdmin(data.agora.user.email);
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    };

    fetchRoomDetails();
  }, [user, linkId]);

  useJoin(
    {
      appid: appId,
      channel: channel,
      token: token || null,
      uid: email,
    },
    calling
  );

  usePublish(
    isAdmin
      ? [localMicrophoneTrack, isScreenSharing ? screenTrack : localCameraTrack]
      : []
  );

  const remoteUsers = useRemoteUsers();

  // Fetch names for remote users when remoteUsers changes
  useEffect(() => {
    const uids = remoteUsers.map(u => u.uid);

    const fetchNames = async () => {
      if (uids.length) {
        const nameMap = {};
        for (const uid of uids) {
          try {
            const response = await axios.put(`https://samzraa.onrender.com/api/users/name/${uid}`);
            nameMap[uid] = response.data.name; // assuming API returns { name: ... }
          } catch (error) {
            nameMap[uid] = "Unknown";
          }
        }
        setNames(nameMap);
      }
    };

    fetchNames();
  }, [remoteUsers]);

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const track = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: "1080p_1" },
        "auto"
      );
      if (localCameraTrack) await client.unpublish(localCameraTrack);
      await client.publish(track);
      setScreenTrack(track);
      setIsScreenSharing(true);

      track.on("track-ended", () => {
        stopScreenShare();
      });
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (screenTrack) {
      await client.unpublish(screenTrack);
      screenTrack.close();
      setScreenTrack(null);
    }
    if (localCameraTrack) await client.publish(localCameraTrack);
    setIsScreenSharing(false);
  };

  // Optional: leave room logic
  const leaveRoom = async () => {
    try {
      await client.leave();
    } catch (e) {
      console.error("Failed to leave room", e);
    }
    setCalling(false);
  };

  return (
    <div className="h-screen w-screen bg-[#131620] flex flex-col text-white">
      {!isConnected ? (
        <div className="p-10 max-w-md mx-auto flex flex-col gap-4">
          <button
            onClick={() => setCalling(true)}
            className="bg-blue-600 hover:bg-blue-700 py-2 rounded"
          >
            next
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar */}
          <div className="w-60 bg-[#0e1017] border-r border-[#1f2230] p-4">
            <h2 className="text-2xl font-semibold text-center mb-6">Admin</h2>
            <div className="text-center text-gray-500 bg-[#1a1f2c] rounded-2xl w-50 h-25">
              <p className="pt-8">{admin}</p>
            </div>
          </div>
          {/* Video Section */}
          <div className="flex-1 bg-[#131620] justify-center items-center overflow-auto p-6 grid gap-6 grid-cols-1">
            {isAdmin ? (
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                {!isScreenSharing ? (
                  <LocalUser
                    audioTrack={localMicrophoneTrack}
                    cameraOn={cameraOn}
                    micOn={micOn}
                    playAudio={false}
                    videoTrack={localCameraTrack}
                  >
                    <div className="absolute bottom-3 right-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-md flex items-center space-x-2">
                      <span>{email} (Admin)</span>
                    </div>
                  </LocalUser>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#222] text-white rounded-lg">
                    <p>🖥️ You are sharing your screen</p>
                  </div>
                )}
              </div>
            ) : (
              remoteUsers.map((user) => {
                const isRemoteAdmin = user.uid === admin;
                return (
                  isRemoteAdmin && (
                    <div
                      key={user.uid}
                      className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center"
                    >
                      <RemoteUser user={user}>
                        <div className="absolute bottom-3 right-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-md flex items-center space-x-2">
                          <span>{names[user.uid] || "Loading..."} (Admin)</span>
                        </div>
                      </RemoteUser>
                    </div>
                  )
                );
              })
            )}
          </div>
          {/* Right Sidebar */}
          <div
            className={`w-64 bg-[#0e1017] border-l border-[#1f2230] p-4 transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 z-40 ${
              showSidebar ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">
              Room Members
            </h2>
            <div className="mt-4 space-y-2">
              {/* Current User */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 font-bold text-xl">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="text-white">{email}</span>
              </div>
              {/* Remote Users */}
              {remoteUsers.map((user) => (
                <div key={user.uid} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 font-bold text-xl">
                    {names[user.uid] ? names[user.uid].charAt(0).toUpperCase() : "?"}
                  </div>
                  <span className="text-white">
                    {names[user.uid] || "Loading..."}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Bottom Controls */}
      {isConnected && (
        <div className="bg-[#0e1017] py-4 px-6 flex items-center justify-center space-x-4 border-t border-[#1f2230]">
          {isAdmin ? (
            <>
              <button onClick={() => setMic((m) => !m)} className="bg-[#1f2230] hover:bg-[#2b2e3e] p-3 rounded-xl">
                {micOn ? <Mic className="text-white w-5 h-5" /> : <MicOff className="text-red-500 w-5 h-5" />}
              </button>
              <button onClick={() => setCamera((c) => !c)} className="bg-[#1f2230] hover:bg-[#2b2e3e] p-3 rounded-xl">
                {cameraOn ? <Video className="text-white w-5 h-5" /> : <VideoOff className="text-red-500 w-5 h-5" />}
              </button>
              <button onClick={toggleScreenShare} className="bg-[#1f2230] hover:bg-[#2b2e3e] p-3 rounded-xl">
                <Monitor className="text-white w-5 h-5" />
              </button>
              <button onClick={leaveRoom} className="bg-red-600 hover:bg-red-700 p-3 rounded-xl">
                <PhoneOff className="text-white w-5 h-5" />
              </button>
              <button onClick={() => setShowSidebar(!showSidebar)} className="bg-[#1f2230] hover:bg-[#2b2e3e] p-3 rounded-xl relative">
                <Users className="text-white w-5 h-5" />
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {remoteUsers.length}
                </span>
              </button>
            </>
          ) : (
            <>
              <button onClick={leaveRoom} className="bg-red-600 hover:bg-red-700 p-3 rounded-xl">
                <PhoneOff className="text-white w-5 h-5" />
              </button>
              <button onClick={() => setShowSidebar(!showSidebar)} className="bg-[#1f2230] hover:bg-[#2b2e3e] p-3 rounded-xl relative">
                <Users className="text-white w-5 h-5" />
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {remoteUsers.length}
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function WrappedHomePage() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <Room />
    </AgoraRTCProvider>
  );
}