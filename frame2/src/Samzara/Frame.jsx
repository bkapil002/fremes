import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
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
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ReadVideo from "../pages/ReadVideo";

dayjs.extend(utc);
dayjs.extend(timezone);
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
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  const [micOn, setMic] = useState(false);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const [email, setEmail] = useState("");
  const [admin, setAdmin] = useState("");
  const [adminImage, setAdminImage] = useState([]);
  const [names, setNames] = useState({});
  const [pushedUids, setPushedUids] = useState([]);
  const [pushLoading, setPushLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [promotedUid, setPromotedUid] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingtopic, setMeetingtopic] = useState("");
  const [adminName, setAdminName] = useState("");
  const remoteUsers = useRemoteUsers();

  useEffect(() => {
    let timer;

    if (isConnected && user && linkId && meetingTime) {
      const [startStr, endStr] = meetingTime.split(" - ");
      const today = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");

      const startTime = dayjs(`${today} ${startStr}`, "YYYY-MM-DD h:mm A").tz(
        "Asia/Kolkata"
      );
      const endTime = dayjs(`${today} ${endStr}`, "YYYY-MM-DD h:mm A").tz(
        "Asia/Kolkata"
      );

      const now = dayjs().tz("Asia/Kolkata");
      let delay = 0;
      if (now.isBefore(startTime)) {
        delay = startTime.diff(now);
        console.log(
          `User connected early. Waiting ${delay / 1000}s until meeting start.`
        );
      } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
        delay = 0;
        console.log(
          "User connected during meeting. Waiting 1 min to log join."
        );
      } else {
        console.log("User connected after meeting ended. Join not recorded.");
        return;
      }
      timer = setTimeout(() => {
        const joinTime = dayjs().tz("Asia/Kolkata").format();

        const logJoin = async () => {
          try {
            await axios.post(
              `https://samzraa.onrender.com/api/attendance/meeting/join/${linkId}`,
              { joinTime },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Join time recorded:", joinTime);
          } catch (error) {
            console.error("Error logging join time:", error);
          }
        };

        logJoin();
      }, delay);
    }

    return () => clearTimeout(timer);
  }, [isConnected, user, linkId, meetingTime]);

  useEffect(() => {
    let leaveTimer;

    if (user && linkId && meetingTime) {
      const [startStr, endStr] = meetingTime.split(" - ");
      const today = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");

      const endTime = dayjs(`${today} ${endStr}`, "YYYY-MM-DD h:mm A").tz(
        "Asia/Kolkata"
      );
      const now = dayjs().tz("Asia/Kolkata");

      if (now.isBefore(endTime)) {
        const msUntilEnd = endTime.diff(now);
        leaveTimer = setTimeout(async () => {
          try {
            const leaveTime = dayjs().tz("Asia/Kolkata").format();
            await axios.put(
              `https://samzraa.onrender.com/api/attendance/meeting/leave/${linkId}`,
              { leaveTime },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Leave time recorded automatically at meeting end");
          } catch (error) {
            console.error("Error logging leave time:", error);
          }
        }, msUntilEnd);
      }
    }

    if (!isConnected && calling === false) {
      (async () => {
        try {
          const leaveTime = dayjs().tz("Asia/Kolkata").format();
          await axios.put(
            `https://samzraa.onrender.com/api/attendance/meeting/leave/${linkId}`,
            { leaveTime },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          console.log("Leave time recorded manually");
        } catch (error) {
          console.error("Error logging leave time:", error);
        }
      })();
    }

    return () => clearTimeout(leaveTimer);
  }, [isConnected, calling, user, linkId, meetingTime]);

  useEffect(() => {
    const uids = remoteUsers.map((u) => u.uid);
    const fetchNames = async () => {
      if (uids.length) {
        const nameMap = {};

        for (const uid of uids) {
          try {
            const response = await axios.put(
              `https://samzraa.onrender.com/api/users/name/${uid}`
            );
            nameMap[uid] = response.data.name;
          } catch (error) {
            nameMap[uid] = "Unknown";
          }
        }
        setNames(nameMap);
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
        setMeetingTime(data.agora.meetingTime);
        setMeetingtopic(data.agora.meetingType);
        setAdminName(user.name);
      } catch (error) {
        console.error("Error fetching room details:", error);
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
        const res = await axios.get(
          "https://samzraa.onrender.com/api/agora/pushed-uids",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setPushedUids(res.data.map((x) => x.uid));
      } catch {}
    };
    fetchPushedUids();
    const interval = setInterval(fetchPushedUids, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || !linkId) return;
    const fetchPromotedUid = async () => {
      try {
        const res = await axios.get(
          `https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setPromotedUid(res.data.promotedUid);
      } catch (error) {
        console.error("Error fetching promoted UID:", error);
      }
    };
    fetchPromotedUid();
    const interval = setInterval(fetchPromotedUid, 2000);
    return () => clearInterval(interval);
  }, [user, linkId]);

  const handlePushRequest = async () => {
    setPushLoading(true);
    try {
      await axios.post(
        "https://samzraa.onrender.com/api/agora/push-uid",
        { email: user.email },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
    } catch (err) {}
    setPushLoading(false);
  };

  const handleResetOwnRequest = async (uidToRemove) => {
    setResetLoading(true);
    try {
      await axios.delete(
        `https://samzraa.onrender.com/api/agora/unpush-uid/${
          uidToRemove || email
        }`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setPushedUids((uids) =>
        uids.filter((uid) => uid !== (uidToRemove || email))
      );
    } catch (err) {}
    setResetLoading(false);
  };

  const handlePromoteUser = async (uid) => {
    setPromoteLoading(true);
    try {
      if (promotedUid) {
        await handleRemovePromotedUser();
      }

      await axios.post(
        `https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`,
        { uid },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setPromotedUid(uid);
    } catch (error) {
      console.error("Error promoting user:", error);
    }
    setPromoteLoading(false);
  };
  const handleRemovePromotedUser = async () => {
    if (!isAdmin && promotedUid !== email) return;

    setPromoteLoading(true);
    try {
      await axios.delete(
        `https://samzraa.onrender.com/api/agora/promote-uid/${linkId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setPromotedUid(null);
    } catch (error) {
      console.error("Error removing promoted user:", error);
    }
    setPromoteLoading(false);
  };

  const requestingRemoteUsers = remoteUsers.filter((u) =>
    pushedUids.includes(u.uid)
  );

  const isRequesting = pushedUids.includes(email);
  const isPromoted = promotedUid === email;

  const adminRemoteUsers = remoteUsers.filter((user) => user.uid === admin);
  const normalRemoteUsers = remoteUsers.filter((user) => user.uid !== admin);
  const promotedUser =
    promotedUid === email
      ? null
      : remoteUsers.find((user) => user.uid === promotedUid);

  return (
    <div className="flex overflow-hidden">
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {!isConnected ? (
          <div className="  flex justify-center items-center h-screen flex-col ">
            <ReadVideo
              handleRemovePromotedUser={handleRemovePromotedUser}
              handleResetOwnRequest={handleResetOwnRequest}
              setCalling={setCalling}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 ">
              <Online meetingTime={meetingTime} meetingtopic={meetingtopic} />
            </div>
            <div className="flex flex-col -mt-5  lg:flex-row flex-1 p-4 gap-2">
              {/* Sidebar */}
              <div className="w-full lg:w-1/5 flex flex-col gap-4">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#F86925] text-white text-center py-1 text-xs font-semibold">
                    Speaker
                  </div>

                  {/* Video / Image */}
                  {promotedUid && promotedUid !== admin ? (
                    <div className="w-full h-40 sm:h-48 md:h-56 lg:h-60 relative">
                      {isAdmin ? (
                        <LocalUser
                          audioTrack={localMicrophoneTrack}
                          cameraOn={cameraOn}
                          micOn={micOn}
                          playAudio={false}
                          videoTrack={localCameraTrack}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        adminRemoteUsers[0] && (
                          <RemoteUser
                            user={adminRemoteUsers[0]}
                            style={{ width: "100%", height: "100%" }}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-full h-40 sm:h-48 md:h-56 lg:h-60">
                      <img
                        src={
                          adminImage && adminImage.length > 0
                            ? adminImage[0]
                            : "https://community.samzara.in/upload/photos/d-avatar.jpg?cache=0"
                        }
                        alt="Chairperson"
                        className="w-28 h-38 rounded-[4px] object-cover lg:w-full lg:h-full lg:rounded-none"
                      />
                    </div>
                  )}

                  {/* Footer (Name) */}
                  <div className="p-2 text-center">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {adminName}
                    </p>
                  </div>
                </div>
              </div>
              {/* Main video area */}
              <div className="lg:w-3/5 w-full flex flex-col items-center bg-white shadow rounded-lg p-4">
                <div className="border-[#000080] border-[1px] w-full max-w-ful aspect-video flex justify-center items-center">
                  <div className=" w-full h-full object-cover">
                    {promotedUid && promotedUid !== admin ? (
                      promotedUid === email ? (
                        <LocalUser
                          audioTrack={localMicrophoneTrack}
                          cameraOn={cameraOn}
                          micOn={micOn}
                          playAudio={false}
                          videoTrack={localCameraTrack}
                        >
                          <div className="w-full overflow-hidden">
                            <p className="bg-gray-700/60 w-full text-white text-sm text-center truncate">
                              {user.name} (You)
                            </p>
                          </div>
                        </LocalUser>
                      ) : promotedUser ? (
                        <RemoteUser user={promotedUser}>
                          <div className="w-full overflow-hidden">
                            <p className="bg-gray-700/60 w-full text-white text-sm text-center truncate">
                              {names[promotedUid] || "Loading..."}
                            </p>
                          </div>
                        </RemoteUser>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Promoted user not connected
                        </div>
                      )
                    ) : isAdmin ? (
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        playAudio={false}
                        videoTrack={localCameraTrack}
                      >
                        <div className="w-full overflow-hidden">
                          <p className="bg-gray-700/60 w-full text-white text-sm text-center truncate">
                            {user.name}
                          </p>
                        </div>
                      </LocalUser>
                    ) : adminRemoteUsers.length > 0 ? (
                      <RemoteUser user={adminRemoteUsers[0]}>
                        <div className="w-full overflow-hidden">
                          <p className="bg-gray-700/60 w-full text-white text-sm text-center truncate">
                            {names[admin] || "Loading..."}
                          </p>
                        </div>
                      </RemoteUser>
                    ) : (
                      <div className="text-center text-gray-400">
                        Admin not connected
                      </div>
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
                          className="bg-blue-900 text-white cursor-pointer px-2 py-1 md:text-sm  text-xs  rounded-[8px]"
                        >
                          <spam className="flex justify-center gap-2 items-center text-sm">
                            <CameraOff size={17} />
                            Camera Off
                          </spam>
                        </button>
                      ) : !isPromoted ? (
                        !isRequesting ? (
                          <button
                            onClick={handlePushRequest}
                            className="bg-[#F86925] text-white cursor-pointer  px-2 py-1 md:text-sm  text-xs  rounded-[8px]"
                            disabled={pushLoading}
                          >
                            {pushLoading ? "Requesting..." : "Request to Share"}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleResetOwnRequest();
                            }}
                            className="bg-[#F86925] text-white cursor-pointer px-2 py-1 md:text-sm  text-xs  rounded-[8px]"
                            disabled={resetLoading}
                          >
                            {resetLoading ? "Cancelling..." : "Cancel Request"}
                          </button>
                        )
                      ) : null}
                    </>
                  )}

                  {!isAdmin && (
                    <button
                      onClick={async () => {
                        await handleRemovePromotedUser();
                        await handleResetOwnRequest();
                        setCalling(false);
                      }}
                      className="bg-blue-900  text-white  cursor-pointer px-2 py-1 md:text-sm  text-xs  rounded-[8px]"
                    >
                      End call
                    </button>
                  )}
                  {!isAdmin && promotedUid === email && (
                    <button
                      onClick={() => setMic((a) => !a)}
                      className="bg-blue-900 text-white px-2 py-1 md:text-sm  text-xs  rounded-[8px] cursor-pointer "
                    >
                      {micOn ? (
                        <spam className="flex justify-center gap-1 items-center">
                          <Mic Mic size={16} />
                          Mic on
                        </spam>
                      ) : (
                        <spam className="flex justify-center gap-1 items-center">
                          <MicOff Mic size={16} />
                          Mic off
                        </spam>
                      )}
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setCamera((a) => !a)}
                        className="bg-blue-900 cursor-pointer   text-white px-2 py-1 md:text-sm  text-xs  rounded-[8px]"
                      >
                        {cameraOn ? (
                          <spam className="flex justify-center gap-1  items-center">
                            <Camera size={17} />
                            Camera on
                          </spam>
                        ) : (
                          <spam className="flex justify-center gap-1  items-center  ">
                            <CameraOff size={17} />
                            Camera off
                          </spam>
                        )}
                      </button>
                      <button
                        onClick={() => setCalling(false)}
                        className="bg-blue-900  text-white px-2 py-1 cursor-pointer md:text-sm  text-xs rounded-[8px]"
                      >
                        End call
                      </button>
                      <button
                        onClick={() => setMic((a) => !a)}
                        className="bg-blue-900 text-white px-2  py-1  md:text-sm  text-xs  cursor-pointer rounded-[8px]"
                      >
                        {micOn ? (
                          <spam className="flex justify-center gap-1 items-center ">
                            <Mic size={16} />
                            Mic on
                          </spam>
                        ) : (
                          <spam className="flex justify-center gap-1 items-center ">
                            <MicOff size={16} />
                            Mic off
                          </spam>
                        )}
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
                      className="bg-red-600 text-white px-2  py-1  md:text-sm  text-xs  cursor-pointer rounded-[8px]"
                    >
                      {promoteLoading ? "Loading..." : "End Share"}
                    </button>
                  )}

                  {!isAdmin && promotedUid === email && (
                    <button
                      onClick={async () => {
                        await handleRemovePromotedUser();
                        handleResetOwnRequest();
                      }}
                      disabled={promoteLoading}
                      className="bg-red-600 text-white px-2  py-1  md:text-sm  text-xs  cursor-pointer rounded-[8px]"
                    >
                      {promoteLoading ? "Loading..." : "End Share"}
                    </button>
                  )}
                </div>
              </div>
              {/* Right sidebar */}
              <div className="w-full lg:w-1/5 bg-white shadow rounded-lg">
                <div className="bg-[#F86925] text-white text-center py-2 font-semibold rounded-t-lg text-sm sm:text-xs">
                  People Requesting to Share
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-2 gap-3 p-3">
                  {isRequesting && promotedUid !== email && (
                    <div className="w-16 sm:w-20 h-16 sm:h-20 relative mx-auto rounded-full flex items-center justify-center group">
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        playAudio={false}
                        videoTrack={localCameraTrack}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "10%",
                        }}
                      >
                        <div className="w-full overflow-hidden">
                          <p className="bg-gray-700/60 w-full text-white text-xs text-center truncate">
                            {user.name}
                          </p>
                        </div>
                      </LocalUser>
                    </div>
                  )}
                  {requestingRemoteUsers
                    .filter((u) => u.uid !== promotedUid)
                    .map(
                      (u) =>
                        u.uid !== email && (
                          <div
                            key={u.uid}
                            className="flex flex-col items-center space-y-1"
                          >
                            {isAdmin && (
                              <button
                                onClick={() => handleResetOwnRequest(u.uid)}
                                className="text-[10px] sm:text-xs bg-gray-800 hover:bg-red-600 cursor-pointer text-white rounded px-2 py-0.5 mb-1"
                                title="Remove request"
                              >
                                Remove
                              </button>
                            )}

                            <div
                              className={`w-16 sm:w-20 h-16 sm:h-20 mx-auto rounded-full flex items-center justify-center ${
                                isAdmin ? "cursor-pointer" : ""
                              } group`}
                              onClick={() =>
                                isAdmin && handlePromoteUser(u.uid)
                              }
                            >
                              <RemoteUser
                                user={u}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "10%",
                                }}
                              >
                                <div className="w-full overflow-hidden">
                                  <p className="bg-gray-700/60 w-full text-white text-[10px] sm:text-xs text-center truncate">
                                    {names[u.uid] || "Loading..."}
                                  </p>
                                </div>
                              </RemoteUser>
                            </div>
                          </div>
                        )
                    )}
                </div>
              </div>
            </div>
          </>
        )}
        {isConnected && (
          <div>
            <div className="flex -mt-4 flex-col p-3 lg:flex-row gap-4">
              <div className="flex-1 bg-white rounded-2xl shadow">
                {/* Header */}
                <div className="border-b px-6 py-4 text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-green-500 text-sm">●</span>
                  Audience{" "}
                  <span className="text-green-600">
                    ({normalRemoteUsers.length + (!isAdmin ? 1 : 0)})
                  </span>
                </div>

                {/* Audience Grid */}
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {/* Show local user if not admin */}
                  {!isAdmin && !isRequesting && (
                    <div className="flex flex-col items-center justify-center cursor-pointer group">
                      <div className="w-24 h-24 relative mx-auto rounded-full items-center justify-center group cursor-pointer">
                        <LocalUser
                          audioTrack={localMicrophoneTrack}
                          cameraOn={cameraOn}
                          playAudio={false}
                          videoTrack={localCameraTrack}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "12%",
                          }}
                        />
                      </div>
                      <p className="mt-1 w-full text-[#3C3C3C] text-xs sm:text-sm text-center truncate">
                        {user.name}
                      </p>
                    </div>
                  )}

                  {/* Remote normal users */}
                  {normalRemoteUsers
                    .filter((user) => !pushedUids.includes(user.uid))
                    .map(
                      (user) =>
                        user.uid !== email && (
                          <div
                            key={user.uid}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="w-24 h-24 relative mx-auto rounded-full items-center justify-center group cursor-pointer">
                              <RemoteUser
                                user={user}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "12%",
                                }}
                              />
                            </div>
                            <p className="mt-1 w-full text-[#3C3C3C] text-xs sm:text-sm text-center truncate">
                              {names[user.uid] || "Loading..."}
                            </p>
                          </div>
                        )
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="-mt-3">{isConnected && <Know />}</div>
      </div>
    </div>
  );
};

export default Frame;
