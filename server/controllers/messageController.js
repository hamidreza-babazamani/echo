import User from "../models/User.js";
import Message from "../models/Message.js";

// ==================== GET USERS FOR SIDEBAR ====================
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all users except logged-in user
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // Count number of unseen messages
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== GET MESSAGES FOR SELECTED USER ====================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    // Find all messages between 2 users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    // Mark messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== MARK MESSAGE AS SEEN ====================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==================== SEND MESSAGE ====================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Will add Cloudinary later for image
    let imageUrl;
    if (image) {
      // TODO: Upload to cloudinary
      imageUrl = image;
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
