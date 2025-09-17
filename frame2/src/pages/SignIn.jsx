import React from "react";


export default function SignIn() {




  return (
 <div className="flex gap-4 p-4">
      {/* LEFT SIDE (Feed Section) */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* Post Box */}
        <div className="bg-gray-300 animate-pulse h-38 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full" />
            <div className="w-40 h-4 bg-gray-400 rounded-md" />
          </div>
          <div className="flex flex-wrap mt-11 gap-3 place-content-between">
            <div className="h-7 w-37 bg-gray-400 rounded-full" />
            <div className="h-7 w-37 bg-gray-400 rounded-full" />
            <div className="h-7 w-37 bg-gray-400 rounded-full" />
            <div className="h-7 w-30 bg-gray-400 rounded-full" />
          </div>
        </div>
         
         
        {/* Greeting Card */}
        <div className="bg-gray-300 animate-pulse rounded-lg p-4">
          <div className="h-4 w-40 md:w-48 bg-gray-400 rounded-md mb-3" />
          <div className="h-4 w-60 md:w-72 bg-gray-400 rounded-md" />
        </div>
        <div className="bg-gray-300 flex place-content-between animate-pulse rounded-lg p-6 pl-20  pr-20">
          <div className="h-8 w-8 bg-gray-400 rounded-full" />
            <div className="h-8 w-8 bg-gray-400 rounded-full" />
            <div className="h-8 w-8 bg-gray-400 rounded-full" />
            <div className="h-8 w-8 bg-gray-400 rounded-full" />
        </div>

        {/* Feed Post Skeleton */}
        <div className="bg-gray-300  animate-pulse rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full" />
            <div className="w-32 md:w-40 h-4 bg-gray-400 rounded-md" />
          </div>
          <div className="h-32 md:h-80 bg-gray-400 rounded-md mb-3" />
          <div className="flex justify-between mt-2 flex-wrap gap-2">
            <div className="h-6 w-16 md:w-20 bg-gray-400 rounded-full" />
            <div className="h-6 w-16 md:w-20 bg-gray-400 rounded-full" />
            <div className="h-6 w-16 md:w-20 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Sidebar) */}
      <div className="hidden md:flex w-1/3 flex-col gap-4">
        {/* Profile Card */}
        <div className="bg-gray-300 animate-pulse rounded-lg p-4 h-50 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-400 rounded-full mb-3" />
          <div className="w-32 h-4 bg-gray-400 rounded-md mb-2" />
          <div className="w-20 h-4 bg-gray-400 rounded-md" />
        </div>

        {/* Trending */}
        <div className="bg-gray-300 animate-pulse rounded-lg p-4">
          <div className="w-24 h-4 bg-gray-400 rounded-md mb-3" />
          <div className="w-32 h-4 bg-gray-400 rounded-md" />
        </div>

        {/* Ad Section */}
        <div className="bg-gray-300 animate-pulse rounded-lg h-[150px]" />

        {/* People You May Know */}
        <div className="bg-gray-300 animate-pulse rounded-lg p-4">
          <div className="w-40 h-4 bg-gray-400 rounded-md mb-4" />
          <div className="flex gap-3  place-content-between   items-center pl-8 pr-8 ">
            <div className="flex flex-col items-center gap-2 ">
              <div className="w-12 h-12 bg-gray-400 rounded-full" />
              <div className="w-20 h-4 bg-gray-400 rounded-md" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-400 rounded-full" />
              <div className="w-20 h-4 bg-gray-400 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
