import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import echoLogo from "/favicon.png";
import "../SettingsPage.css";

const SettingsPage = () => {
  const {
    authUser,
    updateProfile,
    logout,
    unblockUser,
    getBlockedUsers,
  } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("account");
  const [name, setName] = useState(authUser?.fullName || "");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "violet");
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "medium"
  );
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  const [showOnline, setShowOnline] = useState(
    JSON.parse(localStorage.getItem("showOnline") ?? "true")
  );
  const [readReceipts, setReadReceipts] = useState(
    JSON.parse(localStorage.getItem("readReceipts") ?? "true")
  );
  const [typingIndicator, setTypingIndicator] = useState(
    JSON.parse(localStorage.getItem("typingIndicator") ?? "true")
  );
  const [messageNotif, setMessageNotif] = useState(
    JSON.parse(localStorage.getItem("messageNotif") ?? "true")
  );
  const [soundNotif, setSoundNotif] = useState(
    JSON.parse(localStorage.getItem("soundNotif") ?? "true")
  );
  const [enterSends, setEnterSends] = useState(
    JSON.parse(localStorage.getItem("enterSends") ?? "true")
  );
  const [linkPreviews, setLinkPreviews] = useState(
    JSON.parse(localStorage.getItem("linkPreviews") ?? "true")
  );
  const [autoDownload, setAutoDownload] = useState(
    JSON.parse(localStorage.getItem("autoDownload") ?? "false")
  );
  const [saveMedia, setSaveMedia] = useState(
    JSON.parse(localStorage.getItem("saveMedia") ?? "true")
  );

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  useEffect(() => {
    localStorage.setItem("showOnline", JSON.stringify(showOnline));
    localStorage.setItem("readReceipts", JSON.stringify(readReceipts));
    localStorage.setItem("typingIndicator", JSON.stringify(typingIndicator));
    localStorage.setItem("messageNotif", JSON.stringify(messageNotif));
    localStorage.setItem("soundNotif", JSON.stringify(soundNotif));
    localStorage.setItem("enterSends", JSON.stringify(enterSends));
    localStorage.setItem("linkPreviews", JSON.stringify(linkPreviews));
    localStorage.setItem("autoDownload", JSON.stringify(autoDownload));
    localStorage.setItem("saveMedia", JSON.stringify(saveMedia));
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("language", language);
  }, [
    showOnline,
    readReceipts,
    typingIndicator,
    messageNotif,
    soundNotif,
    enterSends,
    linkPreviews,
    autoDownload,
    saveMedia,
    fontSize,
    language,
  ]);

  // Load blocked users when category changes
  useEffect(() => {
    if (activeCategory !== "blocked") return;

    const loadBlocked = async () => {
      setLoadingBlocked(true);
      const users = await getBlockedUsers();
      setBlockedUsers(users || []);
      setLoadingBlocked(false);
    };

    loadBlocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleSave = async () => {
    const success = await updateProfile({ fullName: name });
    if (success) toast.success("Settings saved!");
  };

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem("theme", themeId);
    window.dispatchEvent(new Event("themeChange"));
    toast.success(`Theme: ${themeId}`);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleUnblock = async (userId) => {
    const success = await unblockUser(userId);
    if (success) {
      setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
    }
  };

  const categories = [
    { id: "account", icon: "♙", label: "Account" },
    { id: "privacy", icon: "🔒", label: "Privacy" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "appearance", icon: "🎨", label: "Appearance" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "media", icon: "🖼️", label: "Media" },
    { id: "blocked", icon: "⊘", label: "Blocked Users" },
    { id: "about", icon: "ⓘ", label: "About" },
  ];

  const themes = [
    { id: "violet", color: "#8b5cf6", label: "Violet" },
    { id: "blue", color: "#3b82f6", label: "Blue" },
    { id: "pink", color: "#ec4899", label: "Pink" },
    { id: "green", color: "#10b981", label: "Green" },
    { id: "orange", color: "#f97316", label: "Orange" },
    { id: "red", color: "#ef4444", label: "Red" },
  ];

  return (
    <div className="settings-shell">
      {/* NAV */}
      <aside className="settings-nav">
        <div className="brand">
          <img src={echoLogo} alt="Echo Chat" className="brand-icon" />
          <b>Echo Chat</b>
        </div>

        <nav>
          <button onClick={() => navigate("/")}>
            <span>💬</span> <span>Chats</span>
          </button>
          <button onClick={() => navigate("/profile")}>
            <span>👤</span> <span>Profile</span>
          </button>
          <button className="active">
            <span>⚙️</span> <span>Settings</span>
          </button>
        </nav>

        <div className="nav-note">
          Better settings.
          <br />
          Smoother conversations. 💜
        </div>
      </aside>

      {/* CATEGORIES */}
      <aside className="categories">
        <h1>⚙ Settings</h1>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </aside>

      {/* CONTENT */}
      <main className="settings-content">
        {/* ================= ACCOUNT ================= */}
        {activeCategory === "account" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Account Settings</h2>
              <p>Manage your account information</p>
            </div>

            <div className="account-grid">
              <div className="card account-card">
                <div className="avatar-row">
                  <img
                    src={authUser?.profilePic || "https://i.pravatar.cc/180"}
                    alt="avatar"
                  />
                  <button
                    className="primary"
                    onClick={() => navigate("/profile")}
                  >
                    Change Avatar
                  </button>
                </div>

                <label>
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label>
                  Username
                  <input
                    value={authUser?.email?.split("@")[0] || ""}
                    disabled
                  />
                </label>

                <label>
                  Email
                  <input value={authUser?.email || ""} disabled />
                </label>

                <button className="save" onClick={handleSave}>
                  Save Changes
                </button>
              </div>

              <div className="card">
                <h3>App Settings</h3>
                <p className="muted">Customize your experience</p>

                <label>
                  Language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Persian</option>
                    <option>Japanese</option>
                  </select>
                </label>

                <h3>Theme</h3>
                <div className="themes">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      className={`theme ${theme === t.id ? "selected" : ""}`}
                      onClick={() => handleThemeChange(t.id)}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: t.color,
                          margin: "0 auto 4px",
                        }}
                      ></div>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <h3>Chat Font Size</h3>
                <div className="font-size">
                  <button
                    className={fontSize === "small" ? "selected" : ""}
                    onClick={() => setFontSize("small")}
                  >
                    A⁻
                  </button>
                  <button
                    className={fontSize === "medium" ? "selected" : ""}
                    onClick={() => setFontSize("medium")}
                  >
                    A
                  </button>
                  <button
                    className={fontSize === "large" ? "selected" : ""}
                    onClick={() => setFontSize("large")}
                  >
                    A⁺
                  </button>
                </div>

                <div className="switch-row">
                  <span>Show online status</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showOnline}
                      onChange={(e) => setShowOnline(e.target.checked)}
                    />
                    <i></i>
                  </label>
                </div>

                <div className="switch-row">
                  <span>Read receipts</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={readReceipts}
                      onChange={(e) => setReadReceipts(e.target.checked)}
                    />
                    <i></i>
                  </label>
                </div>

                <div className="switch-row">
                  <span>Typing indicator</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={typingIndicator}
                      onChange={(e) => setTypingIndicator(e.target.checked)}
                    />
                    <i></i>
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PRIVACY ================= */}
        {activeCategory === "privacy" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Privacy</h2>
              <p>Control who can see your activity.</p>
            </div>
            <div className="card">
              <div className="switch-row">
                <span>Last seen</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <i></i>
                </label>
              </div>
              <div className="switch-row">
                <span>Profile photo visibility</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <i></i>
                </label>
              </div>
              <div className="switch-row">
                <span>Allow message requests</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <i></i>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* ================= NOTIFICATIONS ================= */}
        {activeCategory === "notifications" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Notifications</h2>
              <p>Choose how Echo Chat notifies you.</p>
            </div>
            <div className="card">
              <div className="switch-row">
                <span>Message notifications</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={messageNotif}
                    onChange={(e) => setMessageNotif(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
              <div className="switch-row">
                <span>Sound</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={soundNotif}
                    onChange={(e) => setSoundNotif(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* ================= APPEARANCE ================= */}
        {activeCategory === "appearance" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Appearance</h2>
              <p>Customize the look and feel.</p>
            </div>
            <div className="card">
              <h3>Theme</h3>
              <div className="themes">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    className={`theme ${theme === t.id ? "selected" : ""}`}
                    onClick={() => handleThemeChange(t.id)}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: t.color,
                        margin: "0 auto 4px",
                      }}
                    ></div>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= CHAT ================= */}
        {activeCategory === "chat" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Chat</h2>
              <p>Conversation preferences.</p>
            </div>
            <div className="card">
              <div className="switch-row">
                <span>Enter sends message</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enterSends}
                    onChange={(e) => setEnterSends(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
              <div className="switch-row">
                <span>Link previews</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={linkPreviews}
                    onChange={(e) => setLinkPreviews(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* ================= MEDIA ================= */}
        {activeCategory === "media" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Media</h2>
              <p>Control media behavior.</p>
            </div>
            <div className="card">
              <div className="switch-row">
                <span>Auto-download images</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoDownload}
                    onChange={(e) => setAutoDownload(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
              <div className="switch-row">
                <span>Save received media</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={saveMedia}
                    onChange={(e) => setSaveMedia(e.target.checked)}
                  />
                  <i></i>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* ================= BLOCKED ================= */}
        {activeCategory === "blocked" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>Blocked Users</h2>
              <p>Users you have blocked.</p>
            </div>

            {loadingBlocked ? (
              <div className="card empty">Loading...</div>
            ) : blockedUsers.length === 0 ? (
              <div className="card empty">No blocked users.</div>
            ) : (
              <div className="card">
                {blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="blocked-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <img
                      src={user.profilePic || "https://i.pravatar.cc/100"}
                      alt={user.fullName}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {user.fullName}
                      </div>
                      <div style={{ color: "#7183a9", fontSize: "11px" }}>
                        {user.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(user._id)}
                      style={{
                        padding: "8px 16px",
                        background:
                          "linear-gradient(135deg, #2466f5, #6745ef)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= ABOUT ================= */}
        {activeCategory === "about" && (
          <section className="setting-page active">
            <div className="section-head">
              <h2>About Echo Chat</h2>
              <p>Version 1.0.0</p>
            </div>
            <div className="card">
              <p className="muted">
                A real-time messaging app built with Node.js, Express, MongoDB,
                Socket.IO, and React.
              </p>
            </div>
            <div className="card" style={{ marginTop: "16px" }}>
              <h3>Account</h3>
              <p className="muted">Logged in as {authUser?.email}</p>
              <button
                className="save"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ff6b6b",
                  marginTop: "12px",
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;