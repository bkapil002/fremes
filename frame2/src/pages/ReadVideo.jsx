import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, X } from "lucide-react";

const ReadVideo = ({
  handleRemovePromotedUser,
  handleResetOwnRequest,
  setCalling,
  meetingDescription,
  meetingtopic,
  meetingTime,
  meetingDate,
}) => {
  const videoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setPermissionDenied(false);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        setPermissionDenied(true);
        setCameraOn(false);
        setMicOn(false);
        setShowModal(true);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleMic = () => {
    if (stream && stream.getAudioTracks().length > 0) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (permissionDenied && !cameraOn) {
      setShowModal(true);
      return;
    }
    if (stream && stream.getVideoTracks().length > 0) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setCameraOn(!cameraOn);
    }
  };


  const isMeetingExpired = (() => {
  try {
    const meetingDateObj = new Date(meetingDate);


    const [startTime, endTime] = meetingTime.split("-").map(t => t.trim());

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const dateObj = new Date(meetingDateObj);
      dateObj.setHours(hours);
      dateObj.setMinutes(minutes || 0);
      dateObj.setSeconds(0);
      return dateObj;
    };

    const startDateTime = parseTime(startTime);
    const endDateTime = parseTime(endTime);

    const earlyJoinTime = new Date(startDateTime.getTime() - 6 * 60 * 1000);

    const now = new Date();
    if (now < earlyJoinTime) return true;

    if (now > endDateTime) return true;

    // Otherwise → enabled
    return false;
  } catch (err) {
    console.error("Error parsing date/time:", err);
    return false;
  }
})();

  return (
    <div className=" h-screen  mt-10">
      {/* Meeting Header */}
      <div className="text-center  mb-6 px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f89939] mb-3 leading-tight">
          {meetingtopic}
        </h1>
        {meetingDescription && (
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {meetingDescription}
          </p>
        )}
      </div>

      {/* Main Section */}
      <div className="flex w-full justify-center items-center px-4 pb-10">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          {/* Video Section */}
          <div className="relative w-full md:w-2/3 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 md:h-[340px] lg:h-[400px] object-cover"
            />
            <div className="absolute bottom-4 right-4 flex space-x-3">
              {/* Mic Button */}
              <button
                onClick={toggleMic}
                className="bg-gray-800 p-3 rounded-full shadow-md hover:bg-gray-700 transition"
                title={micOn ? "Mute Mic" : "Unmute Mic"}
              >
                {micOn ? (
                  <Mic className="text-white" size={22} />
                ) : (
                  <MicOff className="text-white" size={22} />
                )}
              </button>

              {/* Camera Button */}
              <button
                onClick={toggleCamera}
                className="bg-gray-800 p-3 rounded-full shadow-md hover:bg-gray-700 transition"
                title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {cameraOn ? (
                  <Video className="text-white" size={22} />
                ) : (
                  <VideoOff className="text-white" size={22} />
                )}
              </button>
            </div>
          </div>

          {/* Join Section */}
          <div className="flex flex-col justify-center  items-center w-full md:w-1/3 text-center p-8 bg-gray-50 border-l border-gray-200">
            {/* Title */}
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#f89939] mb-8 tracking-wide">
              Ready to <span className="loading-dots -ml-2"></span>
            </p>

            {/* Join Button */}
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  await handleRemovePromotedUser();
                  await handleResetOwnRequest();
                  setCalling(true);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || isMeetingExpired}
              className={` relative bg-[#178a43] hover:bg-[#000080]  disabled:hover:bg-[#178a43]   transition-all duration-300 text-white px-8 py-3  rounded-xl font-semibold w-full md:w-4/5  hadow-lg hover:shadow-xl   disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span className="font-medium">Joining...</span>
                </div>
              ) : (
                "Join Now"
              )}
            </button>

            {/* Small note */}
            <p className="mt-5 text-sm text-gray-500">
              Make sure your camera & mic are working before joining
            </p>
          </div>
        </div>
      </div>

      {/* Permission Error Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/60 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-3">Permission Blocked</h2>
            <p className="text-gray-700 mb-4 text-sm">
              To enable your camera or microphone:
            </p>
            <ol className="list-decimal pl-5 text-gray-600 text-sm space-y-1">
              <li>Click the lock icon in your browser's address bar.</li>
              <li>
                Go to <b>Site Settings</b> or <b>Permissions</b>.
              </li>
              <li>
                Set <b>Camera</b> and <b>Microphone</b> to <b>Allow</b>.
              </li>
              <li>Refresh the page and try again.</li>
            </ol>
            <button
              onClick={() => setShowModal(false)}
              className="mt-5 bg-[#178a43] hover:bg-[#000080] transition text-white px-4 py-2 rounded-lg w-full"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadVideo;
