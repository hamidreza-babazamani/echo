import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { QRCodeSVG } from "qrcode.react";
import "../ProfilePage.css";

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

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save notification settings
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
      alert("New passwords do not match!");
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

  const copyId = () => {
    navigator.clipboard.writeText(authUser?._id);
    setCopied(true);
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

  const themes = [
    { id: "violet", color: "#8b5cf6", label: "Violet" },
    { id: "blue", color: "#3b82f6", label: "Blue" },
    { id: "pink", color: "#ec4899", label: "Pink" },
    { id: "green", color: "#10b981", label: "Green" },
    { id: "orange", color: "#f97316", label: "Orange" },
    { id: "red", color: "#ef4444", label: "Red" },
  ];

  return (
    <div className="profile-page">
      <div className="profile-bg-blob profile-bg-blob-1"></div>
      <div className="profile-bg-blob profile-bg-blob-2"></div>
      <div className="profile-bg-blob profile-bg-blob-3"></div>

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">
            My <span>Profile</span>
          </h1>
          <button onClick={() => navigate("/")} className="profile-back-btn">
            ← Back to Chat
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {["profile", "theme", "security", "notifications", "qr"].map(
            (tab) => (
              <button
                key={tab}
                className={`profile-tab ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "profile" && "👤 Profile"}
                {tab === "theme" && "🎨 Theme"}
                {tab === "security" && "🔒 Security"}
                {tab === "notifications" && "🔔 Notifications"}
                {tab === "qr" && "📱 QR Code"}
              </button>
            )
          )}
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* ========== TAB: PROFILE ========== */}
          {activeTab === "profile" && (
            <>
              <div className="profile-avatar-section">
                <label htmlFor="avatar" className="profile-avatar-label">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={(e) => setSelectedImg(e.target.files[0])}
                    hidden
                  />
                  <div className="profile-avatar-wrapper">
                    <img
                      src={
                        selectedImg
                          ? URL.createObjectURL(selectedImg)
                          : authUser?.profilePic || "https://i.pravatar.cc/200"
                      }
                      alt="Profile"
                      className="profile-avatar-img"
                    />
                    <div className="profile-avatar-edit">✎</div>
                    <div className="profile-avatar-ring"></div>
                  </div>
                </label>
                <p className="profile-avatar-hint">Click to change avatar</p>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-stat-icon">📤</div>
                  <div className="profile-stat-value">
                    {stats?.messagesSent ?? "—"}
                  </div>
                  <div className="profile-stat-label">Sent</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-icon">📥</div>
                  <div className="profile-stat-value">
                    {stats?.messagesReceived ?? "—"}
                  </div>
                  <div className="profile-stat-label">Received</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-icon">💬</div>
                  <div className="profile-stat-value">
                    {stats?.totalChats ?? "—"}
                  </div>
                  <div className="profile-stat-label">Chats</div>
                </div>
              </div>

              <div className="profile-info-box">
                <div className="profile-info-row">
                  <div className="profile-info-label">👤 Name</div>
                  <div className="profile-info-value">
                    {authUser?.fullName}
                  </div>
                </div>
                <div className="profile-info-row">
                  <div className="profile-info-label">📧 Email</div>
                  <div className="profile-info-value">{authUser?.email}</div>
                </div>
                <div className="profile-info-row">
                  <div className="profile-info-label">🆔 User ID</div>
                  <div className="profile-info-value profile-id-value">
                    <span>{authUser?._id?.slice(-12)}</span>
                    <button onClick={copyId} className="profile-copy-btn">
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="profile-info-row">
                  <div className="profile-info-label">📅 Joined</div>
                  <div className="profile-info-value">
                    {formatDate(authUser?.createdAt)}
                  </div>
                </div>
                <div className="profile-info-row">
                  <div className="profile-info-label">🕐 Last Activity</div>
                  <div className="profile-info-value">
                    {formatRelative(stats?.lastActivity)}
                  </div>
                </div>
                <div className="profile-info-row">
                  <div className="profile-info-label">🟢 Status</div>
                  <div className="profile-info-value profile-status">
                    <span className="profile-status-dot"></span>
                    Online
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-field">
                  <label className="profile-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell something about yourself..."
                    className="profile-textarea"
                  ></textarea>
                </div>

                <div className="profile-buttons">
                  <button
                    type="submit"
                    disabled={loading}
                    className="profile-save-btn"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="profile-logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========== TAB: THEME ========== */}
          {activeTab === "theme" && (
            <div className="profile-section">
              <h2 className="profile-section-title">🎨 Choose Your Theme</h2>
              <p className="profile-section-desc">
                Pick a color that matches your style.
              </p>

              <div className="profile-themes-grid">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    className={`profile-theme-btn ${
                      theme === t.id ? "active" : ""
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div
                      className="profile-theme-color"
                      style={{ background: t.color }}
                    ></div>
                    <span>{t.label}</span>
                    {theme === t.id && (
                      <div className="profile-theme-check">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========== TAB: SECURITY ========== */}
          {activeTab === "security" && (
            <div className="profile-section">
              <h2 className="profile-section-title">🔒 Change Password</h2>
              <p className="profile-section-desc">
                Keep your account secure with a strong password.
              </p>

              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="profile-field">
                  <label className="profile-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    className="profile-input"
                  />
                </div>

                <button type="submit" className="profile-save-btn">
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* ========== TAB: NOTIFICATIONS ========== */}
          {activeTab === "notifications" && (
            <div className="profile-section">
              <h2 className="profile-section-title">🔔 Notifications</h2>
              <p className="profile-section-desc">
                Manage how you get notified about new messages.
              </p>

              <div className="profile-toggle-list">
                <div className="profile-toggle-item">
                  <div>
                    <div className="profile-toggle-label">🔊 Sound</div>
                    <div className="profile-toggle-desc">
                      Play sound for new messages
                    </div>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                    />
                    <span className="profile-switch-slider"></span>
                  </label>
                </div>

                <div className="profile-toggle-item">
                  <div>
                    <div className="profile-toggle-label">
                      💻 Desktop Notifications
                    </div>
                    <div className="profile-toggle-desc">
                      Show desktop notifications
                    </div>
                  </div>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={desktopNotif}
                      onChange={(e) => setDesktopNotif(e.target.checked)}
                    />
                    <span className="profile-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========== TAB: QR CODE ========== */}
          {activeTab === "qr" && (
            <div className="profile-section">
              <h2 className="profile-section-title">📱 My Profile QR</h2>
              <p className="profile-section-desc">
                Share your profile with others by scanning this code.
              </p>

              <div className="profile-qr-container">
                <div className="profile-qr-box">
                  <QRCodeSVG
                    value={`${window.location.origin}/user/${authUser?._id}`}
                    size={200}
                    bgColor="transparent"
                    fgColor="#a78bfa"
                    level="H"
                  />
                </div>
                <p className="profile-qr-hint">
                  Scan with your phone to open my profile
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="profile-footer">Echo Chat © 2026 · Made with 💜</p>
      </div>
    </div>
  );
};

export default ProfilePage;