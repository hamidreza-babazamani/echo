import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import echoLogo from "/favicon.png";
import "../Chat.css";

const HomePage = () => {
  const { logout, onlineUsers, authUser } = useAuth();
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
  } = useChat();

  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "violet");

  const scrollEnd = useRef();

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

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

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

  const goToProfile = () => {
    window.location.href = "/profile";
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="chat-app" data-theme={theme}>
      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="chat-sidebar">
        <div className="brand">
          <img src={echoLogo} alt="Echo Chat" className="brand-logo" />
          <span>Echo Chat</span>

          <div style={{ position: "relative", marginLeft: "auto" }}>
            <button
              className="more-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>

            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "#282142",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "8px",
                  minWidth: "180px",
                  zIndex: 100,
                  marginTop: "8px",
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
                    fontSize: "14px",
                  }}
                >
                  👤 My Profile
                </button>

                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "4px 0",
                  }}
                ></div>

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
                    fontSize: "14px",
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="user-list">
          {filteredUsers.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginTop: "20px",
                fontSize: "13px",
              }}
            >
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`user-item ${
                  selectedUser?._id === user._id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  setShowMenu(false);
                }}
              >
                <img
                  src={user.profilePic || "https://i.pravatar.cc/100"}
                  alt={user.fullName}
                />
                <div className="user-info">
                  <strong>{user.fullName}</strong>
                  <span>
                    <i
                      style={{
                        background: isOnline(user._id) ? "#16e58b" : "#666",
                      }}
                    ></i>
                    {isOnline(user._id) ? "online" : "offline"}
                  </span>
                </div>

                {unseenMessages[user._id] > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#7c4dff",
                      color: "white",
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    {unseenMessages[user._id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ========== CHAT MAIN ========== */}
      <main className="chat-main">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <div className="current-user">
                <img
                  src={selectedUser.profilePic || "https://i.pravatar.cc/100"}
                  alt={selectedUser.fullName}
                />
                <div>
                  <h3>{selectedUser.fullName}</h3>
                  <span>
                    <i
                      style={{
                        background: isOnline(selectedUser._id)
                          ? "#16e58b"
                          : "#666",
                      }}
                    ></i>
                    {isOnline(selectedUser._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <button className="info-btn">ⓘ</button>
            </header>

            {/* PINNED MESSAGES */}
            {pinnedMessages.length > 0 && (
              <div
                style={{
                  padding: "12px 20px",
                  background: "rgba(139, 92, 246, 0.15)",
                  borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  color: "white",
                }}
              >
                <span style={{ fontSize: "16px" }}>📌</span>
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pinnedMessages[pinnedMessages.length - 1].text || "📷 Image"}
                </div>
                <span style={{ fontSize: "11px", color: "#8892b8" }}>
                  Pinned
                </span>
              </div>
            )}

            <div className="messages">
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    marginTop: "40px",
                    fontSize: "14px",
                  }}
                >
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.senderId === authUser?._id;
                  const isMenuOpen = openMessageMenu === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`message-row ${isSent ? "sent" : "received"}`}
                    >
                      {!isSent && (
                        <img
                          src={
                            selectedUser.profilePic ||
                            "https://i.pravatar.cc/100"
                          }
                          alt=""
                        />
                      )}
                      <div style={{ position: "relative" }}>
                        {msg.image ? (
                          <img
                            src={msg.image}
                            alt=""
                            className="message-image"
                          />
                        ) : (
                          <div
                            className={`message ${
                              isSent ? "sent-message" : "received-message"
                            }`}
                            style={{
                              border: msg.pinned
                                ? "2px solid #fbbf24"
                                : "none",
                            }}
                          >
                            {msg.text}
                          </div>
                        )}
                        <time>{formatTime(msg.createdAt)}</time>

                        {/* Message Menu (only for own messages) */}
                        {isSent && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMessageMenu(
                                  isMenuOpen ? null : msg._id
                                );
                              }}
                              style={{
                                position: "absolute",
                                [isSent ? "left" : "right"]: "-32px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.7,
                              }}
                            >
                              ⋮
                            </button>

                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: "absolute",
                                  [isSent ? "left" : "right"]: "-140px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "#1e1e2e",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "10px",
                                  padding: "6px",
                                  zIndex: 50,
                                  minWidth: "130px",
                                  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                                }}
                              >
                                <button
                                  onClick={() => {
                                    pinMessage(msg._id);
                                    setOpenMessageMenu(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  📌 {msg.pinned ? "Unpin" : "Pin"}
                                </button>

                                <button
                                  onClick={() => {
                                    deleteMessage(msg._id);
                                    setOpenMessageMenu(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    background: "transparent",
                                    border: "none",
                                    color: "#ff6b6b",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollEnd}></div>
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <button type="button" className="attach-btn">
                ＋
              </button>
              <input
                type="text"
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="button" className="emoji-btn">
                ☺
              </button>
              <button type="submit" className="send-btn">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            Select a user to start chatting
          </div>
        )}
      </main>

      {/* ========== RIGHT SIDEBAR ========== */}
      <aside className="profile-sidebar">
        {selectedUser ? (
          <>
            <div className="profile">
              <div className="profile-avatar-wrapper">
                <img
                  src={selectedUser.profilePic || "https://i.pravatar.cc/200"}
                  alt={selectedUser.fullName}
                />
                <span
                  style={{
                    background: isOnline(selectedUser._id) ? "#13dd83" : "#666",
                  }}
                ></span>
              </div>
              <h2>{selectedUser.fullName}</h2>
              <p>{isOnline(selectedUser._id) ? "Online" : "Offline"}</p>
              <div className="profile-line"></div>
              <p className="about">{selectedUser.bio || "No bio yet"}</p>
            </div>

            <div className="profile-section">
              <h4>Shared Media</h4>
              <div className="media-grid">
                {messages.filter((msg) => msg.image).length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      gridColumn: "span 2",
                    }}
                  >
                    No media shared yet
                  </p>
                ) : (
                  messages
                    .filter((msg) => msg.image)
                    .slice(0, 4)
                    .map((msg, i) => (
                      <img key={i} src={msg.image} alt="" />
                    ))
                )}
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <div
            style={{ textAlign: "center", color: "#666", marginTop: "40px" }}
          >
            No user selected
          </div>
        )}
      </aside>
    </div>
  );
};

export default HomePage;