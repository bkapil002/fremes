import Donation from "./Donate.png";

const Know = () => {
  const links = [
    "Who is an Addict",
    "What is the NA Program",
    "Why Are We Here",
    "We Do Recover",
    "12 Traditions of NA",
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full p-3 gap-2">
      {/* Donation Card */}
      <div className="flex-shrink-0 w-full lg:w-1/5">
        <div
          className="bg-white space-y-4 rounded-2xl shadow p-2 w-full flex flex-col items-center">
          <img
            src={Donation}
            alt="Donate"
            className="w-20 h-20 sm:w-11 sm:h-11 object-contain"
          />
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 md:px-4 md:py-2 rounded-[8px] transition text-sm md:text-xs"
          >
            Donate
          </button>
        </div>
      </div>

      {/* Know More Links */}
      <div className="flex-1">
        <div className="bg-white rounded-md shadow-sm">
          <div className="border-b p-4 text-gray-700 text-base font-semibold">
            Know More
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 
                      gap-3 p-4 text-green-700 text-xs font-semibold"
          >
            {links.map((link, index) => (
              <a
                key={index}
                href="#"
                className="hover:underline truncate hover:text-green-900"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Know;
