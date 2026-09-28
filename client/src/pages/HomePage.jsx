import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import echoLogo from "/favicon.png";
import "../Chat.css";

const HomePage = () => {
  const { logout, onlineUsers, authUser, blockUser } = useAuth();
  const {
    users,
    messages,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
    sendMessage,
    deleteMessage,
    pinMessage,
    getUsers,
  } = useChat();

  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState("images");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "violet");

  const scrollEnd = useRef();

  // Theme sync
  useEffect(() => {
    const updateTheme = () => {
      setTheme(localStorage.getItem("theme") || "violet");
    };
    window.addEventListener("themeChange", updateTheme);
    return () => window.removeEventListener("themeChange", updateTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchInput) return users;
    return users.filter((u) =>
      u.fullName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, users]);

  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.pinned),
    [messages]
  );

  const sharedImages = useMemo(
    () => messages.filter((m) => m.image),
    [messages]
  );

  // Auto scroll
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages on user select
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  // Clear unseen
  useEffect(() => {
    if (selectedUser) {
      setUnseenMessages((prev) => ({ ...prev, [selectedUser._id]: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  // Close message menu on outside click
  useEffect(() => {
    const closeMenu = () => setOpenMessageMenu(null);
    if (openMessageMenu) {
      document.addEventListener("click", closeMenu);
      return () => document.removeEventListener("click", closeMenu);
    }
  }, [openMessageMenu]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleBlock = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Block ${selectedUser.fullName}?`)) return;

    const success = await blockUser(selectedUser._id);
    if (success) {
      setSelectedUser(null);
      await getUsers();
    }
  };

  const goToProfile = () => {
    window.location.href = "/profile";
  };

  const goToSettings = () => {
    window.location.href = "/settings";
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  // ==================== RENDER ====================
  return (
    <div className="app-shell" data-theme={theme}>

      {/* ========== 1. NAV SIDEBAR ========== */}
      <aside className="sidebar">
        <div className="brand">
          <img src={echoLogo} alt="Echo Chat" className="brand-icon" />
          <b>Echo Chat</b>
        </div>

        <nav>
          <button className="nav-item active">
            <span>💬</span> <span>Chats</span>
          </button>
          <button
            className="nav-item"
            onClick={() => setSelectedUser(null)}
          >
            <span>👥</span> <span>Contacts</span>
          </button>
          <button className="nav-item" onClick={goToSettings}>
            <span>⚙️</span> <span>Settings</span>
          </button>
        </nav>

        <div className="online-title">
          <span></span> Online Now <b>{onlineUsers.length}</b>
        </div>

        <div className="online-list">
          {users
            .filter((u) => isOnline(u._id))
            .slice(0, 5)
            .map((user) => (
              <div
                key={user._id}
                className="online-user"
                onClick={() => setSelectedUser(user)}
              >
                <img
                  src={user.profilePic || "https://i.pravatar.cc/80"}
                  alt={user.fullName}
                />
                <span>
                  {user.fullName}
                  <small>Online</small>
                </span>
              </div>
            ))}
          {onlineUsers.length === 0 && (
            <p
              style={{
                color: "#7181a7",
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              No one online
            </p>
          )}
        </div>

        <div className="sidebar-footer">
          Good conversations
          <br />
          make a better day. 💜
        </div>
      </aside>

      {/* ========== 2. CONVERSATION LIST ========== */}
      <section className="conversation-list">
        <div className="search">
          <input
            placeholder="Search users or chats..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button>⌕</button>
        </div>

        <div className="chat-list">
          {filteredUsers.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginTop: "20px",
                fontSize: "12px",
              }}
            >
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => {
              return (
                <div
                  key={user._id}
                  className={`chat ${
                    selectedUser?._id === user._id ? "active" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <img
                    src={user.profilePic || "https://i.pravatar.cc/80"}
                    alt={user.fullName}
                  />
                  <div>
                    <b>{user.fullName}</b>
                    <small>{user.bio || "Start a conversation"}</small>
                  </div>
                  <time>
                    {isOnline(user._id) ? "Online" : "Offline"}
                  </time>
                  {unseenMessages[user._id] > 0 && (
                    <em>{unseenMessages[user._id]}</em>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========== 3. CHAT PANEL ========== */}
      <main className="chat-panel">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <img
                src={selectedUser.profilePic || "https://i.pravatar.cc/80"}
                alt={selectedUser.fullName}
              />
              <div>
                <b>{selectedUser.fullName}</b>
                <small>
                  {isOnline(selectedUser._id) ? "● Online" : "○ Offline"}
                </small>
              </div>
              <div className="header-actions">
                <button
                  title="Voice Call"
                  onClick={() => alert("Voice call coming soon!")}
                >
                  📞
                </button>
                <button
                  title="Video Call"
                  onClick={() => alert("Video call coming soon!")}
                >
                  📹
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ position: "relative" }}
                >
                  ⋮
                </button>
              </div>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "70px",
                    right: "20px",
                    background: "#1e1e2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "8px",
                    minWidth: "180px",
                    zIndex: 100,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <button
                    onClick={goToProfile}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    onClick={goToSettings}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  >
                    ⚙️ Settings
                  </button>
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.1)",
                      margin: "4px 0",
                    }}
                  ></div>
                  <button
                    onClick={handleBlock}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      color: "#ff6b6b",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  >
                    🚫 Block User
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      color: "#ff6b6b",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </header>

            {/* PINNED MESSAGES */}
            {pinnedMessages.length > 0 && (
              <div className="pinned-bar">
                <span>📌</span>
                <div>
                  {pinnedMessages[pinnedMessages.length - 1].text ||
                    "📷 Image"}
                </div>
                <span>Pinned</span>
              </div>
            )}

            <div className="messages">
              <div className="date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              {messages.length === 0 ? (
                <div className="empty-msg">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.senderId === authUser?._id;
                  const isMenuOpen = openMessageMenu === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`message ${
                        isSent ? "outgoing" : "incoming"
                      }`}
                      style={{
                        border: msg.pinned
                          ? "2px solid #fbbf24"
                          : "none",
                      }}
                    >
                      {msg.image ? (
                        <img
                          src={msg.image}
                          alt=""
                          style={{
                            maxWidth: "240px",
                            borderRadius: "10px",
                          }}
                        />
                      ) : (
                        msg.text
                      )}
                      <small>
                        {formatTime(msg.createdAt)}
                        {isSent && " ✓✓"}
                      </small>

                      {/* Menu (only for own messages) */}
                      {isSent && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMessageMenu(
                                isMenuOpen ? null : msg._id
                              );
                            }}
                            className="msg-menu-btn"
                          >
                            ⋮
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="msg-menu"
                            >
                              <button
                                onClick={() => {
                                  pinMessage(msg._id);
                                  setOpenMessageMenu(null);
                                }}
                              >
                                📌 {msg.pinned ? "Unpin" : "Pin"}
                              </button>
                              <button
                                onClick={() => {
                                  deleteMessage(msg._id);
                                  setOpenMessageMenu(null);
                                }}
                                style={{ color: "#ff6b6b" }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={scrollEnd}></div>
            </div>

            <form className="composer" onSubmit={handleSendMessage}>
              <button type="button">＋</button>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="button">☺</button>
              <button className="send" type="submit">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="no-user">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </main>

      {/* ========== 4. PROFILE PANEL ========== */}
      <aside className="profile-panel">
        {selectedUser ? (
          <>
            <div className="profile-cover"></div>
            <img
              className="profile-avatar"
              src={
                selectedUser.profilePic || "https://i.pravatar.cc/160"
              }
              alt={selectedUser.fullName}
            />
            <h2>{selectedUser.fullName}</h2>
            <div className="status">
              ● {isOnline(selectedUser._id) ? "Online" : "Offline"}
            </div>

            <p className="profile-bio">
              {selectedUser.bio || "No bio yet."}
            </p>

            <hr />
            <h3>About</h3>
            <p>{selectedUser.email}</p>

            <hr />
            <h3>Shared Media</h3>

            <div className="tabs">
              <button
                className={activeMediaTab === "images" ? "selected" : ""}
                onClick={() => setActiveMediaTab("images")}
              >
                Images
              </button>
              <button
                className={activeMediaTab === "videos" ? "selected" : ""}
                onClick={() => setActiveMediaTab("videos")}
              >
                Videos
              </button>
              <button
                className={activeMediaTab === "files" ? "selected" : ""}
                onClick={() => setActiveMediaTab("files")}
              >
                Files
              </button>
            </div>

            <div className="media-grid">
              {activeMediaTab === "images" &&
                (sharedImages.length === 0 ? (
                  <p className="empty-media">No images yet</p>
                ) : (
                  sharedImages.slice(0, 4).map((msg, i) => (
                    <img key={i} src={msg.image} alt="" />
                  ))
                ))}

              {activeMediaTab === "videos" && (
                <p className="empty-media">No videos yet</p>
              )}

              {activeMediaTab === "files" && (
                <p className="empty-media">No files yet</p>
              )}
            </div>

            <button
              className="logout-panel-btn"
              onClick={handleBlock}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ff6b6b",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              🚫 Block User
            </button>
          </>
        ) : (
          <div className="no-user-profile">
            <p>No user selected</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default HomePage;