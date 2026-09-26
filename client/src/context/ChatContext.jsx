import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { axios, socket, authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // ==================== GET USERS ====================
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== GET MESSAGES ====================
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== SEND MESSAGE ====================
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== SOCKET MESSAGES ====================
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedUser]);

  // ==================== LOAD USERS ON AUTH ====================
  useEffect(() => {
    if (!authUser) return;

    const loadUsers = async () => {
      try {
        const { data } = await axios.get("/api/messages/users");
        if (data.success) {
          setUsers(data.users);
          setUnseenMessages(data.unseenMessages);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, socket]);

  const value = {
    users,
    messages,
    selectedUser,
    unseenMessages,
    setUnseenMessages,
    setSelectedUser,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => useContext(ChatContext);