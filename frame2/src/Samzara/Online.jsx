import { FaCircle, FaShareAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Online = ({ meetingTime, meetingtopic }) => {
  const getCurrentTimeCustom = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHour}:${minutes} ${ampm}`;
  };
  const navigate = useNavigate();
  return (
    <div className="-mt-2">
      <div className=" p-4 space-y-2">
        <div className="bg-white rounded-md shadow-sm p-2 md:p-3 flex items-center justify-between">
          {/* Left & Center Content */}
          <div className="flex flex-1 pl-15 justify-center items-center gap-2">
            <FaCircle className="text-green-600 text-[9px] md:text-xs" />
            <span className="md:text-[25px] text-sm font-semibold text-[#2A2A72]">
              Live Online Meetings
            </span>
          </div>

          {/* Right Content */}
          <div className="flex items-center gap-1 cursor-pointer pr-2 text-indigo-900 font-semibold  text-[12px] md:text-sm "
          aria-label="Share"
          onClick={() => {
              const shareData = {
                url: window.location.href,
              };

              if (navigator.share) {
                navigator.share(shareData).catch((error) => {});
              } else {
                const message = encodeURIComponent(
                  `${shareData.text}\n${shareData.url}`
                );
                window.open(`https://wa.me/?text=${message}`, "_blank");
              }
            }}>
            <FaShareAlt size={10} />
            <span>Share</span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm md:p-6  p-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            {/* Left Side */}
            <div className="text-center md:text-left">
              <div className="md:text-base text-sm font-semibold text-[#2A2A72]">
                {meetingtopic}
              </div>
              <div className="text-red-600 md:text-sm text-xs ">
                From :<span className=" font-semibold">({meetingTime})</span>
              </div>
            </div>

            {/* Middle Links */}
            <div className="text-center">
              <div className="space-x-2 text-blue-600 md:text-sm text-xs flex flex-wrap justify-center">
                <a href="#" className="hover:underline">
                  Big Book
                </a>
                <span>|</span>
                <a href="#" className="hover:underline">
                  12 and 12
                </a>
                <span>|</span>
                <a href="#" className="hover:underline">
                  AA Homepage
                </a>
              </div>
              <div className="mt-1 text-sm">
                <span className="md:text-sm text-xs">Meeting Topic:</span>{" "}
                <span className="font-semibold md:text-sm text-xs">
                  {meetingtopic}
                </span>
              </div>
            </div>

            {/* Right Side */}
            <div className="text-center -mt-2 md:mt-0 md:text-right md:text-sm text-xs">
              <span className="font-semibold md:text-sm text-xsmd:text-sm text-xs">
                Current Time:
              </span>{" "}
              <span className="text-red-600 font-semibold">
                {getCurrentTimeCustom()}
              </span>
              <div>
                <button
                  className="text-gray-600 hover:underline md:text-sm text-xs cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Online;
