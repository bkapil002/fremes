import { Mic, MicOff,Camera ,CameraOff , Menu } from "lucide-react";
import SideBar from "./SideBar";
import Online from "./Online";
import Know from "./Know";
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
import Audience from "./Audience";


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
  const [promotedUid, setPromotedUid] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
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


  useEffect(() => {
    if (!user || !linkId) return;
    const fetchPromotedUid = async () => {
      try {
        const res = await axios.get(`https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPromotedUid(res.data.promotedUid);
      } catch (error) {
        console.error('Error fetching promoted UID:', error);
      }
    };
    fetchPromotedUid();
    const interval = setInterval(fetchPromotedUid, 2000);
    return () => clearInterval(interval);
  }, [user, linkId]);

  const handlePushRequest = async () => {
    setPushLoading(true);
    try {
      await axios.post('https://samzraa.onrender.com/api/agora/push-uid', { email: user.email }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) {
    }
    setPushLoading(false);
  };

  const handleResetOwnRequest = async (uidToRemove) => {
    setResetLoading(true);
    try {
      await axios.delete(`https://samzraa.onrender.com/api/agora/unpush-uid/${uidToRemove || email}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPushedUids((uids) => uids.filter(uid => uid !== (uidToRemove || email)));
    } catch (err) {
    }
    setResetLoading(false);
  };

  const handlePromoteUser = async (uid) => {
  setPromoteLoading(true);
  try { 
    if (promotedUid) {
      await handleRemovePromotedUser();
    }

    await axios.post(`https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`,
      { uid },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );
    setPromotedUid(uid);
  } catch (error) {
    console.error('Error promoting user:', error);
  }
  setPromoteLoading(false);
};
  const handleRemovePromotedUser = async () => {
    if (!isAdmin && promotedUid !== email) return;

    setPromoteLoading(true);
    try {
      await axios.delete(`https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPromotedUid(null);
    } catch (error) {
      console.error('Error removing promoted user:', error);
    }
    setPromoteLoading(false);
  };

  const requestingRemoteUsers = remoteUsers.filter(
    u => pushedUids.includes(u.uid)
  );

  const isRequesting = pushedUids.includes(email);
  const isPromoted = promotedUid === email;
  const adminRemoteUsers = remoteUsers.filter(user => user.uid === admin);
  const normalRemoteUsers = remoteUsers.filter(user => user.uid !== admin);
  const promotedUser = promotedUid === email ? null : remoteUsers.find(user => user.uid === promotedUid);

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
              onClick={async () => { await handleRemovePromotedUser(); await handleResetOwnRequest(); setCalling(true); }}
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
              {/* Sidebar */}
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
                {/* Admin video panel (only when a normal user is promoted) */}
                {promotedUid && promotedUid !== admin && (
                  <div>
                    {isAdmin ? (
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        playAudio={false}
                        videoTrack={localCameraTrack}
                        style={{ borderRadius: '2%', width: '100%', height: '100%' }}
                      />
                    ) : (
                      adminRemoteUsers[0] && (
                        <RemoteUser
                          user={adminRemoteUsers[0]}
                          style={{ borderRadius: '2%', width: '100%', height: '100%' }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
              {/* Main video area */}
              <div className="lg:w-3/5 w-full flex flex-col items-center bg-white shadow rounded-lg p-4">
                <div className="border rounded-lg w-full max-w-[640px] aspect-video flex justify-center items-center">
                  <div className="rounded-lg w-full h-full object-cover">
                    {/* Show promoted user (if promotedUid set and NOT admin), else show admin */}
                    {promotedUid && promotedUid !== admin ? (
                      promotedUid === email ? (
                        <LocalUser
                          audioTrack={localMicrophoneTrack}
                          cameraOn={cameraOn}
                          micOn={micOn}
                          playAudio={true}
                          videoTrack={localCameraTrack}
                          style={{ borderRadius: '2%' }}
                        >
                          <div className="w-full overflow-hidden">
                            <p className="bg-gray-700/60 w-full text-white text-xl text-center truncate">
                              {user.name} (You)
                            </p>
                          </div>
                        </LocalUser>
                      ) : promotedUser ? (
                        <RemoteUser
                          user={promotedUser}
                          style={{ borderRadius: '2%' }}
                        >
                          <div className="w-full overflow-hidden">
                            <p className="bg-gray-700/60 w-full text-white text-xl text-center truncate">
                              {names[promotedUid] || "Loading..."}
                            </p>
                          </div>
                        </RemoteUser>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Promoted user not connected
                        </div>
                      )
                    ) : (
                      isAdmin ? (
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
                      )
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  
                  {!isAdmin && (
                    <>
                      {!cameraOn ? (
                        <button
                          onClick={() => setCamera(true)}
                          className="bg-blue-900 text-white px-3 py-1 cursor-pointer text-sm rounded-lg"
                        >
                         <spam className='flex justify-center gap-2 items-center'><CameraOff/>Camera Off</spam>
                        </button>
                      ) : !isPromoted ? (
                        !isRequesting ? (
                          <button
                            onClick={handlePushRequest}
                            className="bg-orange-400 text-white px-3 cursor-pointer py-1 text-sm rounded-lg"
                            disabled={pushLoading}
                          >
                            {pushLoading ? "Requesting..." : "Request to Share"}
                          </button>
                        ) : (
                          <button
                            onClick={async () => { await handleResetOwnRequest(); setCamera(false); }}
                            className="bg-orange-400 text-white cursor-pointer px-3 py-1 text-sm rounded-lg"
                            disabled={resetLoading}
                          >
                            {resetLoading ? "Cancelling..." : "Cancel Request"}
                          </button>
                        )
                      ) : null}
                    </>
                  )}


                  {!isAdmin && (
                    <button onClick={async () => {await handleRemovePromotedUser();  await handleResetOwnRequest();  setCalling(false) }} className="bg-blue-900  text-white px-3 py-1 cursor-pointer text-sm rounded-lg">
                      End call
                    </button>
                  )}
                  {!isAdmin && promotedUid === email && (
                    <button onClick={() => setMic(a => !a)} className="bg-blue-900 text-white px-3 py-1 text-sm cursor-pointer rounded-lg">
                      {micOn ? <spam className='flex justify-center gap-2 items-center'><Mic/>Mic On</spam> : <spam className='flex justify-center gap-2 items-center'><MicOff/>Mic off</spam>}
                    </button>
                  )}


                  {isAdmin && (
                    <>
                    <button onClick={() => setCamera(a => !a)} className="bg-blue-900 cursor-pointer text-white px-3 py-1 text-sm rounded-lg">
                      {cameraOn ? <spam className='flex justify-center gap-2 items-center'><Camera/>Camera On</spam> : <spam className='flex justify-center gap-2 items-center'><CameraOff/>Camera off</spam>}
                    </button>
                      <button onClick={() => setCalling(false)} className="bg-blue-900  text-white px-3 py-1 cursor-pointer text-sm rounded-lg">
                        End call
                      </button>
                      <button onClick={() => setMic(a => !a)} className="bg-blue-900 text-white px-3 py-1 text-sm cursor-pointer rounded-lg">
                         {micOn ? <spam className='flex justify-center gap-2 items-center'><Mic/>Mic On</spam> : <spam className='flex justify-center gap-2 items-center'><MicOff/>Mic off</spam>}
                      </button>
                    </>
                  )}

                  {isAdmin && promotedUid && (
                    <button
                      onClick={async () => {
                      await handleRemovePromotedUser();
                      await handleResetOwnRequest(promotedUid); 
                       }}
                      disabled={promoteLoading}
                      className="bg-red-600 text-white px-3 py-1 text-sm cursor-pointer rounded-lg"
                    >
                      {promoteLoading ? "Loading..." : "End Share"}
                    </button>
                  )}
                  
                  {!isAdmin && promotedUid === email && (
                    <button
                      onClick={async () => {
                     await handleRemovePromotedUser();
                      await handleResetOwnRequest();
                      setCamera(false);
                      }}
                      disabled={promoteLoading}
                      className="bg-red-600 text-white px-3 py-1 text-sm cursor-pointer rounded-lg"
                    >
                      {promoteLoading ? "Loading..." : "End Share"}
                    </button>
                  )}
                </div>
              </div>
              {/* Right sidebar */}
              <div className="lg:w-1/5 w-full bg-white shadow rounded-lg p-1">
                <div className="bg-orange-500 text-white text-center py-1 font-semibold rounded">
                  People Requesting to Share
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 mt-2">
                  {isRequesting && (
                    <div
                      className="w-20 h-20 relative mx-auto rounded-full flex items-center justify-center group "
                      
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
                  {requestingRemoteUsers.map(u => (
                    u.uid !== email &&
                    <div key={u.uid} className="flex flex-col items-center space-y-1">
                      {isAdmin && (
                              <button
                                onClick={() => handleResetOwnRequest(u.uid)}
                                className="text-xs bg-gray-800 hover:bg-red-600 cursor-pointer text-white rounded px-2 py-0.5 mb-1"
                                title="Remove request"
                              >
                                Remove
                              </button>
                            )}
                    <div className={`w-20 h-20  mx-auto rounded-full flex items-center justify-center ${isAdmin?'cursor-pointer':''} group`}
                      onClick={() => isAdmin && handlePromoteUser(u.uid)}>
                      <RemoteUser user={u} style={{ width: "100%", height: "100%", borderRadius: "10%" }}>
                        <div className="w-full overflow-hidden">
                          <p className="bg-gray-700/60 w-full text-white text-xs text-center truncate">
                            {names[u.uid] || "Loading..."}
                            
                          </p>
                        </div>
                      </RemoteUser>
                      </div>
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
                className="w-24 h-24 relative mx-auto rounded-full flex items-center justify-center group"
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
            <Audience normalRemoteUsers={normalRemoteUsers} isAdmin={isAdmin} email={email} user={user} image={image} names={names} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Frame;