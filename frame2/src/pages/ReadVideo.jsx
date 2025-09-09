import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff ,X} from "lucide-react";

const ReadVideo = ({
  handleRemovePromotedUser,
  handleResetOwnRequest,
  setCalling,
  meetingDescription,
  meetingtopic
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
      stream.getVideoTracks().forEach(
        (track) => (track.enabled = !track.enabled)
      );
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="flex w-full justify-center h-screen items-center px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-xl overflow-hidden">
        {/* Video Section */}
        <div className="relative w-full md:w-1/2 lg:w-2/3 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 md:h-[300px] lg:h-[350px] object-cover"
          />
          <div className="absolute bottom-3 right-3 flex space-x-3">
            {/* Mic Button */}
            <button
              onClick={toggleMic}
              className="bg-gray-800 p-3 rounded-full hover:bg-gray-700"
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
              className="bg-gray-800 p-3 rounded-full hover:bg-gray-700"
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
        <div className="flex flex-col  justify-center items-center w-full md:w-1/2 lg:w-1/3 text-center p-4 bg-gray-50">
        <p className="text-[30px] md:text-[30px] lg:text-[30px] font-bold text-[#f89939] mb-3 line-clamp-1" >{meetingtopic}</p>
        <p  className=" text-gray-600 ">{meetingDescription}</p>
          <p className="text-lg md:text-xl lg:text-2xl mt-4 font-bold text-[#f89939] mb-4">
            Ready to 
            <span className="loading-dots ml-2"></span>
          </p>
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
            disabled={isLoading}
            className="bg-[#178a43] cursor-pointer hover:bg-[#000080]  text-white px-5 py-3 rounded-[8px] font-semibold mb-4 w-full md:w-3/4"
          >
            {isLoading ? (
              <div className="flex items-center  justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white"xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <span>Joing...</span>
              </div>
            ) : (
              "Join "
            )}
          </button>
        </div>
      </div>

      {/* Permission Error */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/60 bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Permission Blocked</h2>
            <p className="text-gray-700 mb-4">
              To enable your camera or microphone:
            </p>
            <ol className="list-decimal pl-5 text-gray-600 text-sm space-y-2">
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
              className="mt-4 bg-[#178a43] hover:bg-[#000080] cursor-pointer text-white px-4 py-2 rounded-[8px] w-full"
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
