import { Menu } from "lucide-react";
import SideBar from "./SideBar";
import Online from "./Online";
import Know from "./Know";
import Donation from './Donate.png';
import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useEffect, useState } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Mic, MicOff } from "lucide-react"; 

export const Frame = () => {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <Basics />
    </AgoraRTCProvider>
  );
};

const Basics = () => {
  const { linkId } = useParams();
  const { user } = useAuth();
  const [membersOpen, setMembersOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  const [micOn, setMic] = useState(false);
  const [cameraOn, setCamera] = useState(false);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const [email, setEmail] = useState("");
  const [admin, setAdmin] = useState('');
  const [adminImage, setAdminImage] = useState([]);
  const [names, setNames] = useState({});
  const [image, setImage] = useState({});
  const [pushedUids, setPushedUids] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  

  const remoteUsers = useRemoteUsers();

  

  useEffect(() => {
    const uids = remoteUsers.map(u => u.uid);

    const fetchNames = async () => {
      if (uids.length) {
        const nameMap = {};
        const imageMap = {};
        for (const uid of uids) {
          try {
            const response = await axios.put(`https://samzraa.onrender.com/api/users/name/${uid}`);
            nameMap[uid] = response.data.name; 
            imageMap[uid] = response.data.imageUrls;
          } catch (error) {
            nameMap[uid] = "Unknown";
            imageMap[uid] = "";
          }
        }
        setNames(nameMap);
        setImage(imageMap);
      }
    };

    fetchNames();
  }, [remoteUsers]);

  useJoin(
    {
      appid: appId,
      channel: channel,
      token: token || null,
      uid: email,
    },
    calling
  );

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
        setAdminImage(data.agora.user.imageUrls);
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    };

    fetchRoomDetails();
  }, [user, linkId]);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  const isAdmin = email === admin;


  useEffect(() => {
    if (!user) return;
    const fetchPushedUids = async () => {
      try {
        const res = await axios.get('https://samzraa.onrender.com/api/agora/pushed-uids', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPushedUids(res.data.map(x => x.uid));
      } catch { }
    };
    fetchPushedUids();
    const interval = setInterval(fetchPushedUids, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Push request handler
  const handlePushRequest = async () => {
    setPushLoading(true);
    try {
      await axios.post('https://samzraa.onrender.com/api/agora/push-uid', { email: user.email }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) {
      // Already requested or error
    }
    setPushLoading(false);
  };

  // Reset request handler (admin)
  // const handleResetOwnRequest = async () => {
  //   setResetLoading(true);
  //   try {
  //     await axios.delete('https://samzraa.onrender.com/api/agora/unpush-uid', {
  //       headers: { Authorization: `Bearer ${user.token}` }
  //     });
  //     setPushedUids((uids) => uids.filter(uid => uid !== email));
  //   } catch (err) {
  //     // handle error
  //   }
  //   setResetLoading(false);
  // };

const handleResetOwnRequest = async (uidToRemove) => {
  setResetLoading(true);
  try {
    await axios.delete(`https://samzraa.onrender.com/api/agora/unpush-uid/${uidToRemove || email}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setPushedUids((uids) => uids.filter(uid => uid !== (uidToRemove || email)));
  } catch (err) {
    // handle error
  }
  setResetLoading(false);
};

  const requestingRemoteUsers = remoteUsers.filter(
    u => pushedUids.includes(u.uid)
  );
  const isRequesting = pushedUids.includes(email);

  const adminRemoteUsers = remoteUsers.filter(user => user.uid === admin);
  const normalRemoteUsers = remoteUsers.filter(user => user.uid !== admin);

  return (
    <div className="h-screen flex overflow-hidden">
      <div
        className={`fixed md:static top-0 left-0 h-full shadow-lg w-64 p-4 bg-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <SideBar
          membersOpen={membersOpen}
          setSidebarOpen={setSidebarOpen}
          setMembersOpen={setMembersOpen}
          resourcesOpen={resourcesOpen}
          setResourcesOpen={setResourcesOpen}
        />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>
          {`
            .overflow-y-auto::-webkit-scrollbar { display: none; }
            .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        <div className="flex items-center justify-between p-4 bg-white shadow md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {!isConnected ? (
          <div className="p-10 max-w-md mx-auto flex flex-col gap-4">
            <button
              onClick={async () => { await handleResetOwnRequest(); setCalling(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer py-2 px-3 rounded"
            >
              Ready to join
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 p-6">
              <Online />
            </div>
            <div className="flex flex-col lg:flex-row flex-1 p-4 gap-4">
              <div className="lg:w-1/5 w-full flex flex-col gap-4">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="bg-orange-500 text-white text-center py-1 font-semibold">
                    Speaker
                  </div>
                  <img
                    src={adminImage && adminImage.length > 0 ? adminImage[0] : ""}
                    alt="Chairperson"
                    className="w-full object-cover"
                  />
                  <div className="p-2 text-center">
                    <p className="text-sm text-gray-500">{admin}</p>
                  </div>
                </div>
              </div>

              {/* Center area: Always show admin's video */}
              <div className="lg:w-3/5 w-full flex flex-col items-center bg-white shadow rounded-lg p-4">
                <div className="border rounded-lg w-full max-w-[640px] aspect-video flex justify-center items-center">
                  <div className="rounded-lg w-full h-full object-cover">
                    {isAdmin ? (
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        playAudio={false}
                        videoTrack={localCameraTrack}
                        style={{ borderRadius: '2%' }}
                      >
                        <div className="w-full overflow-hidden">
                          <p className="bg-gray-700/60 w-full text-white text-xl text-center truncate">
                            {user.name}
                          </p>
                        </div>
                      </LocalUser>
                    ) : (
                      adminRemoteUsers.length > 0 ? (
                        <RemoteUser user={adminRemoteUsers[0]} style={{ borderRadius: '2%' }}>
                          <div className="w-full overflow-hidden">
                            <p className="bg-gray-700/60 w-full text-white text-xl text-center truncate">
                              {names[admin] || "Loading..."}
                            </p>
                          </div>
                        </RemoteUser>
                      ) : (
                        <div className="text-center text-gray-400">Admin not connected</div>
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {isAdmin && (
                    <button onClick={() => setCamera(a => !a)} className="bg-blue-900 cursor-pointer text-white px-3 py-1 text-sm rounded-lg">
                      {cameraOn ? "Turn Cam Off" : "Turn Cam On"}
                    </button>
                  )}
         
             {!isAdmin && (
               <>
               {!cameraOn ? (
                <button
                 onClick={() => setCamera(true)}
                 className="bg-blue-900 text-white px-3 py-1 cursor-pointer text-sm rounded-lg">
                Turn Cam On
                </button>
                 ) : !isRequesting ? (
                <button
                   onClick={handlePushRequest}
                  className="bg-orange-400 text-white px-3 cursor-pointer py-1 text-sm rounded-lg"
                   disabled={pushLoading}  >
                   {pushLoading ? "Requesting..." : "Request to Share"}
                </button>
                 ) : (
               <button onClick={async () => { await handleResetOwnRequest(); setCamera(false); }}className="bg-orange-400 text-white cursor-pointer px-3 py-1 text-sm rounded-lg"
                 disabled={resetLoading}>
                   {resetLoading ? "Cancelling..." : "Cancel Request"}
                 </button>
                      )}
                 </>
              )

                }
                  
                  {!isAdmin && (
                    <button onClick={async () => { await handleResetOwnRequest(); setCalling(false)}} className="bg-blue-900 text-white px-3 py-1 cursor-pointer text-sm rounded-lg">
                    End call
                  </button>
                  )}
                  
                {isAdmin && (
                  <>
                  <button onClick={() => setCalling(false)} className="bg-blue-900 text-white px-3 py-1 cursor-pointer text-sm rounded-lg">
                    End call
                  </button>
                  <button onClick={() => setMic(a => !a)} className="bg-blue-900 text-white px-3 py-1 text-sm cursor-pointer rounded-lg">
                    {micOn ? "Mute Mic" : "Unmute Mic"}
                  </button>
                  </>
                )}
                </div>
              </div>

             <div className="lg:w-1/5 w-full bg-white shadow rounded-lg p-1">
              <div className="bg-orange-500 text-white text-center py-1 font-semibold rounded">
             People Requesting to Share
             </div>
           <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 mt-2">
             {/* Show current user if they are requesting */}
           {isRequesting && (
       <div
        className="w-20 h-20 relative mx-auto rounded-full flex items-center justify-center group cursor-pointer"
        onClick={() => setMic((prev) => !prev)}
      >
        <LocalUser
          audioTrack={localMicrophoneTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          playAudio={false}
          videoTrack={localCameraTrack}
          style={{ width: "100%", height: "100%", borderRadius: "10%" }}
        >
          <div className="w-full overflow-hidden">
            <p className="bg-gray-700/60 w-full text-white text-xs text-center truncate">
              {user.name}
              
            </p>
            {/* <span className="absolute top-0 left-0 bg-orange-600 text-white text-xs rounded-full px-1 py-0.8 ">
          {pushedUids.indexOf(email) + 1}
        </span> */}
          </div>
        </LocalUser>
        {/* Show position number */}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          {micOn ? (
            <Mic className="text-white w-6 h-6" />
          ) : (
            <MicOff className="text-white w-6 h-6" />
          )}
        </div>
      </div>
    )}

    {requestingRemoteUsers.map(u => (
      u.uid !== email &&
      <div key={u.uid} className="w-20 h-20 relative mx-auto rounded-full flex items-center justify-center group ">
        <RemoteUser user={u} style={{ width: "100%", height: "100%", borderRadius: "10%" }}>
          <div className="w-full overflow-hidden">
            <p className="bg-gray-700/60 w-full text-white text-xs text-center truncate">
              {names[u.uid] || "Loading..."}
              {/* <span className="absolute top-0 left-0 bg-orange-500 text-white text-xs rounded-full px-1 py-0.8 ">
             {pushedUids.indexOf(u.uid) + 1}
            </span> */}
            {isAdmin &&(
               <button
              onClick={() => handleResetOwnRequest(u.uid)}
              className="absolute top-0 right-0  text-sm   bg-gray-700/100 hover:bg-orange-500/95 truncate text-white  cursor-pointer rounded-full px-1  "
              title="Remove request"
            >
              x
            </button>
            )}
            </p>
          </div>
        </RemoteUser>
      </div>
    ))}
  </div>
</div>
            </div>
          </>
        )}

        {isConnected && (
          <div>
            <Know />

            {!isAdmin && cameraOn && (
              <div
                className="w-24 h-24 relative mx-auto rounded-full flex items-center justify-center group "
              >
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  playAudio={false}
                  videoTrack={localCameraTrack}
                  style={{ width: "100%", height: "100%", borderRadius: "10%" }}
                >
                  <div className="w-full overflow-hidden">
                    <p className="bg-gray-700/60 w-full text-white text-xs text-center truncate">
                      {user.name}
                    </p>
                  </div>
                </LocalUser>

              </div>
            )}

            <div className="flex flex-col p-3 lg:flex-row gap-4 min-h-screen">

              <div className="bg-white space-y-4 rounded-2xl h-60 shadow p-6 w-full max-w-xs mx-auto flex flex-col items-center">
                <img src={Donation} className="text-5xl mb-4" alt="Donate" />
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
                  Donate
                </button>
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow">
                <div className="border-b px-6 py-4 text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-green-500 text-sm">●</span>
                  Audience <span className="text-green-600">({normalRemoteUsers.length + (!isAdmin ? 1 : 0)})</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {!isAdmin && (
                    <div key={email} className="text-center">
                      <img
                        src={user.imageUrls}
                        alt={email}
                        className="w-14 h-14 mx-auto rounded-full object-cover border"
                      />
                      <div className="text-sm font-medium mt-2 text-gray-800">{ user.name }</div>
                    </div>
                  )}
                  {normalRemoteUsers.map((remoteUser) =>
                    remoteUser.uid !== email ? (
                      <div key={remoteUser.uid} className="text-center">
                        <img
                          src={image && image[remoteUser.uid] ? image[remoteUser.uid] : "/default-avatar.png"}
                          alt={remoteUser.uid}
                          className="w-14 h-14 mx-auto rounded-full object-cover border"
                        />
                        <div className="text-sm font-medium mt-2 text-gray-800">
                          {names[remoteUser.uid] || "Loading..."}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Frame;