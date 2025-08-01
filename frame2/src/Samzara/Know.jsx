import React from "react";

const Know = () => {
  const links = [
    "Who is an Addict",
    "What is the NA Program",
    "Why Are We Here",
    "We Do Recover",
    "12 Traditions of NA",
  ];

  return (
    <div className="p-4">
      <div className="bg-white rounded-md shadow-sm">
        {/* Header */}
        <div className="border-b p-4 text-gray-700 text-lg font-semibold">
          Know More
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 text-green-700 text-sm font-medium">
          {links.map((link, index) => (
            <a
              key={index}
              href="#"
              className="hover:underline whitespace-nowrap transition-all duration-150 hover:text-green-900"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Know;
