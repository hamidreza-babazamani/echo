import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import echoLogo from "/favicon.png";
import "../Chat.css";

// ==================== DUMMY DATA ====================
const dummyUsers = [
  {
    _id: "user1",
    fullName: "Alison Martin",
    profilePic: "https://i.pravatar.cc/100?img=47",
    bio: "Hi, I am Alison!",
  },
  {
    _id: "user2",
    fullName: "Martin Johnson",
    profilePic: "https://i.pravatar.cc/100?img=12",
    bio: "Hey, I'm using Echo Chat",
  },
  {
    _id: "user3",
    fullName: "Enrique Martinez",
    profilePic: "https://i.pravatar.cc/100?img=11",
    bio: "Hello there!",
  },
  {
    _id: "user4",
    fullName: "Marco Jones",
    profilePic: "https://i.pravatar.cc/100?img=13",
    bio: "Just chilling",
  },
  {
    _id: "user5",
    fullName: "Richard Smith",
    profilePic: "https://i.pravatar.cc/100?img=14",
    bio: "Hi everyone!",
  },
];

const dummyMessages = [
  {
    _id: "msg1",
    senderId: "user1",
    text: "Hey! How are you doing?",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "msg2",
    senderId: "me",
    text: "I'm doing great! Nice to hear from you.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "msg3",
    senderId: "user1",
    text: "Are you free for a quick chat?",
    createdAt: new Date().toISOString(),
  },
];

// ==================== COMPONENT ====================
const HomePage = () => {
  const { logout } = useAuth();

  const [users] = useState(dummyUsers);
  const [selectedUser, setSelectedUser] = useState(dummyUsers[1]);
  const [messages, setMessages] = useState(dummyMessages);
  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const scrollEnd = useRef();

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchInput) return users;
    return users.filter((u) =>
      u.fullName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, users]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==================== HANDLERS ====================
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      _id: Date.now().toString(),
      senderId: "me",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // ==================== RENDER ====================
  return (
    <div className="chat-app">
      {/* ============ LEFT SIDEBAR ============ */}
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
              <img src={user.profilePic} alt={user.fullName} />
              <div className="user-info">
                <strong>{user.fullName}</strong>
                <span>
                  <i></i>
                  online
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ============ CHAT MAIN ============ */}
      <main className="chat-main">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <div className="current-user">
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                />
                <div>
                  <h3>{selectedUser.fullName}</h3>
                  <span>
                    <i></i>
                    Online
                  </span>
                </div>
              </div>
              <button className="info-btn">ⓘ</button>
            </header>

            <div className="messages">
              {messages.map((msg) => {
                const isSent = msg.senderId === "me";
                return (
                  <div
                    key={msg._id}
                    className={`message-row ${isSent ? "sent" : "received"}`}
                  >
                    {!isSent && <img src={selectedUser.profilePic} alt="" />}
                    <div>
                      <div
                        className={`message ${
                          isSent ? "sent-message" : "received-message"
                        }`}
                      >
                        {msg.text}
                      </div>
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

      {/* ============ RIGHT SIDEBAR ============ */}
      <aside className="profile-sidebar">
        {selectedUser ? (
          <>
            <div className="profile">
              <div className="profile-avatar-wrapper">
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                />
                <span></span>
              </div>
              <h2>{selectedUser.fullName}</h2>
              <p>Online</p>
              <div className="profile-line"></div>
              <p className="about">{selectedUser.bio}</p>
            </div>

            <div className="profile-section">
              <h4>Shared Media</h4>
              <div className="media-grid">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300"
                  alt=""
                />
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