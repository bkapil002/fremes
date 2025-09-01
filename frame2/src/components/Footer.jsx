import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-200 shadow-2xl text-white text-center py-1 mt-auto">
       <div className='flex gap-3 justify-center text-xs md:text-sm  text-gray-600'>
        <Link>
          Privacy Policy
        </Link>
        <Link>
          Terms of Service
        </Link>
       </div>
        <div className='flex  text-xs md:text-sm  justify-center gap-1 '>
            <p className='text-gray-600'>
                Copyright © 2025
            </p>
            <Link to={'https://community.samzara.in'} className='text-[#272974]'>
              community.samzara.in
            </Link>
        </div>
    </footer>
    </div>
  )
}

export default Footer
