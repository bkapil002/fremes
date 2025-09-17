import React from "react";


export default function SignIn() {




  return (
  <div className="flex gap-4 p-4">
  {/* LEFT SIDE (Feed Section) */}
  <div className="w-full md:w-2/3 flex flex-col gap-4">
    {/* Post Box */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-400 rounded-full" />
        <div className="w-40 h-4 bg-gray-400 rounded-md" />
      </div>
      <div className="flex flex-wrap mt-10 justify-center gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-7 w-30 bg-gray-400 rounded-full" />
        ))}
      </div>
    </div>

    {/* Greeting Card */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4 space-y-3">
      <div className="h-4 w-40 bg-gray-400 rounded-md" />
      <div className="h-4 w-60 bg-gray-400 rounded-md" />
    </div>

    {/* Quick Action Icons */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4 flex justify-around">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-8 w-8 bg-gray-400 rounded-full" />
      ))}
    </div>

    {/* Feed Post Skeleton */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-400 rounded-full" />
        <div className="w-32 h-4 bg-gray-400 rounded-md" />
      </div>
      <div className="h-48 md:h-72 bg-gray-400 rounded-md mb-4" />
      <div className="flex justify-between gap-2 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-400 rounded-full" />
        ))}
      </div>
    </div>
  </div>

  {/* RIGHT SIDE (Sidebar) */}
  <div className="hidden md:flex w-1/3 flex-col gap-4">
    {/* Profile Card */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-6 flex flex-col items-center">
      <div className="w-16 h-16 bg-gray-400 rounded-full mb-4" />
      <div className="w-32 h-4 bg-gray-400 rounded-md mb-2" />
      <div className="w-20 h-4 bg-gray-400 rounded-md" />
    </div>

    {/* Trending */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4 space-y-3">
      <div className="w-24 h-4 bg-gray-400 rounded-md" />
      <div className="w-32 h-4 bg-gray-400 rounded-md" />
    </div>

    {/* Ad Section */}
    <div className="bg-gray-300 animate-pulse rounded-lg h-36" />

    {/* People You May Know */}
    <div className="bg-gray-300 animate-pulse rounded-lg p-4">
      <div className="w-40 h-4 bg-gray-400 rounded-md mb-4" />
      <div className="flex justify-around">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-400 rounded-full" />
            <div className="w-20 h-4 bg-gray-400 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  );
}
