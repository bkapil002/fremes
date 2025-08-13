import { FaCircle, FaShareAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const Online = ({meetingTime,meetingtopic}) => {
   const getCurrentTimeCustom = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${displayHour}:${minutes} ${ampm}`;
};
const navigate = useNavigate(); 
  return (
     <div>
        <div className=" p-4 space-y-3">

      <div className="bg-white rounded-md shadow-sm p-4 flex items-center justify-center space-x-2">
        <FaCircle className="text-green-600 text-xs" />
        <span className="text-lg font-medium text-[#2A2A72]">Live Online Meetings</span>
      </div>


      <div className="bg-white rounded-md shadow-sm p-6">
  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
    
    {/* Left Side */}
    <div className="text-center md:text-left">
      <div className="text-base font-semibold text-[#2A2A72]">
        {meetingtopic}
      </div>
      <div className="text-red-600 text-sm">
        From :({meetingTime})
      </div>
    </div>

    {/* Middle Links */}
    <div className="text-center">
      <div className="space-x-2 text-blue-600 text-sm flex flex-wrap justify-center">
        <a href="#" className="hover:underline">Big Book</a>
        <span>|</span>
        <a href="#" className="hover:underline">12 and 12</a>
        <span>|</span>
        <a href="#" className="hover:underline">AA Homepage</a>
      </div>
      <div className="mt-1 text-sm">
        <span className="font-semibold">Meeting Topic:</span>{" "}
        {meetingtopic}
      </div>
    </div>

    {/* Right Side */}
    <div className="text-center md:text-right text-sm">
      <span className="font-semibold">Current Time:</span>{" "}
      <span className="text-red-600 font-semibold">{getCurrentTimeCustom()}</span>
      <div>
        <button className="text-gray-600 hover:underline text-xs" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>

  </div>
   <div
  aria-label="Share"
  className="mt-3 flex items-center space-x-2 text-indigo-900 font-semibold text-sm cursor-pointer -mb-3"
  onClick={() => {
    const shareData = {
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => {});
    } else {

      const message = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
      window.open(`https://wa.me/?text=${message}`, '_blank'); 
    }
  }}
>
  <FaShareAlt />
  <span>Share</span>
</div>
</div>

     </div>
      
    </div>
  )
}

export default Online
