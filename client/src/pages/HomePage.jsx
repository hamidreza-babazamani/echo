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
  } = useChat();

  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const scrollEnd = useRef();

  const filteredUsers = useMemo(() => {
    if (!searchInput) return users;
    return users.filter((u) =>
      u.fullName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, users]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setUnseenMessages((prev) => ({ ...prev, [selectedUser._id]: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

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

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="chat-app">
      <aside className="chat-sidebar">
        <div className="brand">
          <img src={echoLogo} alt="Echo Chat" className="brand-logo" />
          <span>Echo Chat</span>
          <button className="more-btn">⋮</button>
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
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`user-item ${
                selectedUser?._id === user._id ? "active" : ""
              }`}
              onClick={() => setSelectedUser(user)}
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
          ))}
        </div>
      </aside>

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

            <div className="messages">
              {messages.map((msg) => {
                const isSent = msg.senderId === authUser?._id;
                return (
                  <div
                    key={msg._id}
                    className={`message-row ${isSent ? "sent" : "received"}`}
                  >
                    {!isSent && (
                      <img
                        src={
                          selectedUser.profilePic || "https://i.pravatar.cc/100"
                        }
                        alt=""
                      />
                    )}
                    <div>
                      {msg.image ? (
                        <img src={msg.image} alt="" className="message-image" />
                      ) : (
                        <div
                          className={`message ${
                            isSent ? "sent-message" : "received-message"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      <time>{formatTime(msg.createdAt)}</time>
                    </div>
                  </div>
                );
              })}
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
              <p className="about">{selectedUser.bio}</p>
            </div>

            <div className="profile-section">
              <h4>Shared Media</h4>
              <div className="media-grid">
                {messages
                  .filter((msg) => msg.image)
                  .slice(0, 4)
                  .map((msg, i) => (
                    <img key={i} src={msg.image} alt="" />
                  ))}
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>
            No user selected
          </div>
        )}
      </aside>
    </div>
  );
};

export default HomePage;