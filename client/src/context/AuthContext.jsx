import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Set axios base URL once
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ==================== CONNECT SOCKET ====================
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
  };

  // ==================== LOGIN / SIGNUP ====================
  const login = async (state, credentials) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);

    if (data.success) {
      setAuthUser(data.userData);
      connectSocket(data.userData);
      axios.defaults.headers.common["token"] = data.token;
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success(data.message);
      return true;
    } else {
      toast.error(data.message);
      return false;
    }
  } catch (error) {
    toast.error(error.message);
    return false;
  }
};

  // ==================== LOGOUT ====================
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    socket?.disconnect();
  };

  // ==================== UPDATE PROFILE ====================
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== CHECK AUTH ON MOUNT ====================
  useEffect(() => {
    const init = async () => {
      try {
        if (token) {
          axios.defaults.headers.common["token"] = token;
        }

        const { data } = await axios.get("/api/auth/check");
        if (data.success) {
          setAuthUser(data.user);
          connectSocket(data.user);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== SOCKET LISTENERS ====================
  useEffect(() => {
    if (!socket) return;

    socket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);