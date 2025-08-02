import React from 'react'
import Donation from './Donate.png'
const Audience = ({normalRemoteUsers,isAdmin ,email,user,image,names}) => {

  return (
    <div>
       <div className="flex flex-col p-3 lg:flex-row gap-4 min-h-screen">

              <div className="bg-white space-y-4 rounded-2xl h-60 shadow p-6 w-full max-w-xs mx-auto flex flex-col items-center">
                <img src={Donation} className="text-5xl mb-4" alt="Donate" />
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition">
                  Donate
                </button>
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow">
                <div className="border-b px-6 py-4 text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-green-500 text-sm">●</span>
                  Audience <span className="text-green-600">({normalRemoteUsers.length + (!isAdmin ? 1 : 0)})</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {!isAdmin && (
                    <div key={email} className="text-center">
                      <img
                        src={user.imageUrls}
                        alt={email}
                        className="w-14 h-14 mx-auto rounded-full object-cover border"
                      />
                      <div className="text-sm font-medium mt-2 text-gray-800">{ user.name }</div>
                    </div>
                  )}
                  {normalRemoteUsers.map((remoteUser) =>
                    remoteUser.uid !== email ? (
                      <div key={remoteUser.uid} className="text-center">
                        <img
                          src={image && image[remoteUser.uid] ? image[remoteUser.uid] : "/default-avatar.png"}
                          alt={remoteUser.uid}
                          className="w-14 h-14 mx-auto rounded-full object-cover border"
                        />
                        <div className="text-sm font-medium mt-2 text-gray-800">
                          {names[remoteUser.uid] || "Loading..."}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
    </div>
  )
}

export default Audience
