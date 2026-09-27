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

  // ==================== DELETE MESSAGE ====================
  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`);
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        toast.success("Message deleted");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== PIN MESSAGE ====================
  const pinMessage = async (messageId) => {
    try {
      const { data } = await axios.put(`/api/messages/pin/${messageId}`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, pinned: data.pinned } : m
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== SOCKET ====================
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

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleMessagePinned = ({ messageId, pinned }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, pinned } : m))
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messagePinned", handleMessagePinned);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messagePinned", handleMessagePinned);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedUser]);

  // ==================== LOAD USERS ====================
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
    deleteMessage,
    pinMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => useContext(ChatContext);