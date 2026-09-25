import { useMemo } from 'react'
import assets, { imagesDummyData } from '../assets/assets'

const RightSidebar = () => {
  const msgImages = useMemo(() => imagesDummyData, [])

  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll">
      <div className="pt-16 flex flex-col items-center gap-2 text-xs mx-auto">
        {/* User Avatar */}
        <img
          src={assets.profile_martin}
          alt=""
          className="w-20 aspect-square rounded-full"
        />

        {/* User Name + Online Status */}
        <h1 className="text-xl font-medium flex items-center gap-2">
          Martin Johnson
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
        </h1>

        {/* User Bio */}
        <p className="px-10 text-center text-xs">
          Hi Everyone, I am Using QuickChat
        </p>

        <hr className="border border-white/10 w-full my-4" />

        {/* Media Section */}
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img src={url} alt="" className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button className="bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer mt-8 mb-6">
          Logout
        </button>
      </div>
    </div>
  )
}

export default RightSidebar