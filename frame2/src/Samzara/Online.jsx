import { FaCircle, FaShareAlt } from 'react-icons/fa';

const Online = () => {
  return (
    <div>
        <div className=" p-4 space-y-3">

      <div className="bg-white rounded-md shadow-sm p-4 flex items-center justify-center space-x-2">
        <FaCircle className="text-green-600 text-xs" />
        <span className="text-lg font-medium text-indigo-900">Live Online Meetings</span>
      </div>


      <div className="bg-white rounded-md shadow-sm p-4">
        <h3 className="text-indigo-900 text-lg font-semibold text-center">
          We Do Recover
          <span className="text-red-600 font-normal text-sm ml-2">(11:30 PM - 12:30 AM)</span>
        </h3>
        <p className="text-center text-gray-700 text-sm mt-2">
          JFT - Calling a defect a defect & SPAD - Allowing our partners and ourselves to experience personal autonomy means we can grow a
        </p>
         <div
  aria-label="Share"
  className="mt-4 flex items-center space-x-2 text-indigo-900 font-semibold text-sm cursor-pointer"
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
