import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import "../ProfilePage.css";

const Icon = ({ children }) => <span className="icon">{children}</span>;

const ProfilePage = () => {
  const { authUser, updateProfile, logout, getStats, changePassword } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "violet");
  const [soundEnabled, setSoundEnabled] = useState(
    JSON.parse(localStorage.getItem("soundEnabled") ?? "true")
  );
  const [desktopNotif, setDesktopNotif] = useState(
    JSON.parse(localStorage.getItem("desktopNotif") ?? "false")
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const data = await getStats();
      if (data) setStats(data);
    };
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themeChange"));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("desktopNotif", JSON.stringify(desktopNotif));
  }, [desktopNotif]);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem("theme", themeId);
    window.dispatchEvent(new Event("themeChange"));
    toast.success(`Theme: ${themeId}`);
  };

  const copyId = () => {
    navigator.clipboard.writeText(authUser?._id);
    setCopied(true);
    toast.success("ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRelative = (date) => {
    if (!date) return "—";
    const now = new Date().getTime();
    const diff = now - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "theme", label: "Theme", icon: "🎨" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "qr", label: "QR Code", icon: "▦" },
  ];

  const themes = [
    { id: "violet", color: "#8b5cf6", label: "Violet" },
    { id: "blue", color: "#3b82f6", label: "Blue" },
    { id: "pink", color: "#ec4899", label: "Pink" },
    { id: "green", color: "#10b981", label: "Green" },
    { id: "orange", color: "#f97316", label: "Orange" },
    { id: "red", color: "#ef4444", label: "Red" },
  ];

  const username = authUser?.email?.split("@")[0] || "";

  return (
    <div className="profile-page">
      <div className="profile-glow glow-one" />
      <div className="profile-glow glow-two" />

      <div className="profile-container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(12, 27, 58, 0.72)",
            border: "1px solid rgba(104, 132, 190, 0.2)",
            color: "#8e9fbe",
            padding: "8px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "600",
            zIndex: 10,
          }}
        >
          ← Back
        </button>

        {/* Tabs */}
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div className="profile-card">
          {/* ===== TAB: PROFILE ===== */}
          {activeTab === "profile" && (
            <>
              {/* Header */}
              <div className="profile-header">
                <div className="avatar-wrapper">
                  <img
                    src={
                      selectedImg
                        ? URL.createObjectURL(selectedImg)
                        : authUser?.profilePic || "https://i.pravatar.cc/300?img=12"
                    }
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <label htmlFor="avatar" style={{ cursor: "pointer" }}>
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={(e) => setSelectedImg(e.target.files[0])}
                      hidden
                    />
                    <div className="avatar-edit">✎</div>
                  </label>
                </div>

                <div className="profile-name">{authUser?.fullName}</div>
                <div className="profile-handle">@{username}</div>

                <div className="online-status">
                  <span />
                  Online
                </div>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon sent">↑</div>
                  <strong>{stats?.messagesSent ?? 0}</strong>
                  <span>SENT</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon received">↓</div>
                  <strong>{stats?.messagesReceived ?? 0}</strong>
                  <span>RECEIVED</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon chats">💬</div>
                  <strong>{stats?.totalChats ?? 0}</strong>
                  <span>CHATS</span>
                </div>
              </div>

              {/* Info */}
              <div className="info-card">
                <div className="info-row">
                  <div className="info-label">
                    <Icon>👤</Icon>
                    <span>Name</span>
                  </div>
                  <strong>{authUser?.fullName}</strong>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <Icon>✉</Icon>
                    <span>Email</span>
                  </div>
                  <strong>{authUser?.email}</strong>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <Icon>▣</Icon>
                    <span>User ID</span>
                  </div>
                  <div className="user-id">
                    <strong>{authUser?._id?.slice(-12)}</strong>
                    <button onClick={copyId}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <Icon>📅</Icon>
                    <span>Joined</span>
                  </div>
                  <strong>{formatDate(authUser?.createdAt)}</strong>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <Icon>◷</Icon>
                    <span>Last Activity</span>
                  </div>
                  <strong>{formatRelative(stats?.lastActivity)}</strong>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <Icon>●</Icon>
                    <span>Status</span>
                  </div>
                  <div className="online-text">
                    <span />
                    Online
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                    />
                  </div>

                  <div className="input-group">
                    <label>Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      placeholder="Tell something about yourself..."
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    <span>✓</span>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ===== TAB: THEME ===== */}
          {activeTab === "theme" && (
            <div style={{ padding: "10px 0" }}>
              <h2 style={{ color: "white", marginBottom: "8px" }}>
                🎨 Choose Your Theme
              </h2>
              <p style={{ color: "#7183a9", fontSize: "12px", marginBottom: "24px" }}>
                Pick a color that matches your style.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    style={{
                      position: "relative",
                      padding: "20px 10px",
                      borderRadius: "14px",
                      background:
                        theme === t.id
                          ? "rgba(139, 92, 246, 0.2)"
                          : "rgba(12, 27, 58, 0.72)",
                      border:
                        theme === t.id
                          ? "2px solid #8b5cf6"
                          : "1px solid rgba(104, 132, 190, 0.2)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: t.color,
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
                      }}
                    ></div>
                    <span>{t.label}</span>
                    {theme === t.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "white",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== TAB: SECURITY ===== */}
          {activeTab === "security" && (
            <div style={{ padding: "10px 0" }}>
              <h2 style={{ color: "white", marginBottom: "8px" }}>
                🔒 Change Password
              </h2>
              <p style={{ color: "#7183a9", fontSize: "12px", marginBottom: "24px" }}>
                Keep your account secure with a strong password.
              </p>

              <form onSubmit={handlePasswordChange}>
                <div className="form-section">
                  <div className="input-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="input-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="input-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <button type="submit" className="save-button" style={{ width: "100%" }}>
                  <span>🔒</span>
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* ===== TAB: NOTIFICATIONS ===== */}
          {activeTab === "notifications" && (
            <div style={{ padding: "10px 0" }}>
              <h2 style={{ color: "white", marginBottom: "8px" }}>
                🔔 Notifications
              </h2>
              <p style={{ color: "#7183a9", fontSize: "12px", marginBottom: "24px" }}>
                Manage how you get notified about new messages.
              </p>

              <div
                style={{
                  background: "rgba(12, 29, 63, 0.64)",
                  borderRadius: "14px",
                  padding: "20px",
                  border: "1px solid rgba(86, 116, 179, 0.27)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                      🔊 Sound
                    </div>
                    <div style={{ color: "#7183a9", fontSize: "11px", marginTop: "4px" }}>
                      Play sound for new messages
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "16px",
                  }}
                >
                  <div>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                      💻 Desktop Notifications
                    </div>
                    <div style={{ color: "#7183a9", fontSize: "11px", marginTop: "4px" }}>
                      Show desktop notifications
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={desktopNotif}
                      onChange={(e) => setDesktopNotif(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: QR CODE ===== */}
          {activeTab === "qr" && (
            <div style={{ padding: "10px 0", textAlign: "center" }}>
              <h2 style={{ color: "white", marginBottom: "8px" }}>
                📱 My Profile QR
              </h2>
              <p style={{ color: "#7183a9", fontSize: "12px", marginBottom: "24px" }}>
                Share your profile with others by scanning this code.
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "24px",
                  background: "rgba(12, 29, 63, 0.64)",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "24px",
                  boxShadow: "0 15px 50px rgba(139, 92, 246, 0.2)",
                }}
              >
                <QRCodeSVG
                  value={`${window.location.origin}/user/${authUser?._id}`}
                  size={200}
                  bgColor="transparent"
                  fgColor="#a78bfa"
                  level="H"
                />
              </div>

              <p style={{ color: "#7183a9", fontSize: "12px", marginTop: "20px" }}>
                Scan with your phone to open my profile
              </p>
            </div>
          )}
        </div>

        <div className="profile-footer">
          <span>Echo Chat</span>
          <span>•</span>
          <span>Profile & Account</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;