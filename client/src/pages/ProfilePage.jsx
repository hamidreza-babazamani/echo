import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { authUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        await updateProfile({
          profilePic: reader.result,
          fullName: name,
          bio,
        });
      };
    }

    setLoading(false);
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#2d1b4e] to-[#1a1a2e] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 text-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            My <span className="text-violet-400">Profile</span>
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            ← Back to Chat
          </button>
        </div>

        {/* Current User Info */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-gray-300 mb-1">Logged in as:</p>
          <p className="font-semibold text-lg">{authUser?.fullName}</p>
          <p className="text-sm text-violet-300">{authUser?.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {authUser?._id?.slice(-8)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <label htmlFor="avatar" className="cursor-pointer group">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={(e) => setSelectedImg(e.target.files[0])}
                hidden
              />
              <div className="relative">
                <img
                  src={
                    selectedImg
                      ? URL.createObjectURL(selectedImg)
                      : authUser?.profilePic ||
                        "https://i.pravatar.cc/200"
                  }
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-violet-500/30 group-hover:border-violet-500 transition"
                />
                <div className="absolute bottom-0 right-0 w-9 h-9 bg-violet-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                  ✎
                </div>
              </div>
            </label>
            <p className="text-xs text-gray-400">Click to change avatar</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:border-violet-500 text-white placeholder-gray-500 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              rows={4}
              placeholder="Write something about yourself..."
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:border-violet-500 text-white placeholder-gray-500 resize-none transition"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-semibold hover:from-violet-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg font-semibold hover:bg-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;