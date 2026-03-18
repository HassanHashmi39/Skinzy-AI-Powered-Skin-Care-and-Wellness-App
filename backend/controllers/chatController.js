const Message = require('../models/Message');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Send a new message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, attachment } = req.body;
        const senderId = req.user._id;

        if (!receiverId || (!content && !attachment)) {
            return res.status(400).json({ message: 'Receiver ID and content or attachment are required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const messageData = {
            sender: senderId,
            receiver: receiverId,
            content: content || '',
        };

        if (attachment) {
            messageData.attachment = attachment;
        }

        const message = new Message(messageData);
        await message.save();

        // Create notification for receiver
        await Notification.create({
            user: receiverId,
            type: 'message',
            title: `New message from ${req.user.name}`,
            message: content ? (content.substring(0, 50) + (content.length > 50 ? '...' : '')) : 'Sent an attachment',
            relatedId: message._id
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
};

// @desc    Get conversation between logged in user and another user
// @route   GET /api/chat/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest to newest for chat UI

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Server error while fetching conversation' });
    }
};

// @desc    Get user's recent chat list (unique users they've chatted with)
// @route   GET /api/chat/recent
// @access  Private
const getRecentChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages where user is either sender or receiver
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        // Extract unique users and latest message
        const chatList = [];
        const seenUsers = new Set();

        for (const msg of messages) {
            let otherUserId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
            
            if (!seenUsers.has(otherUserId)) {
                seenUsers.add(otherUserId);
                
                // Get other user's info
                const otherUser = await User.findById(otherUserId).select('name email profileImage userType specialization');
                if (otherUser) {
                    chatList.push({
                        user: otherUser,
                        lastMessage: msg,
                        unreadCount: msg.sender.toString() === otherUserId && !msg.isRead ? 1 : 0 // Approximation, to get exact unread we'd need another query
                    });
                }
            } else {
                // If we've seen this user, just increment unread count if applicable
                if (msg.sender.toString() !== userId.toString() && !msg.isRead) {
                    const existingChat = chatList.find(c => c.user._id.toString() === otherUserId);
                    if (existingChat) {
                        existingChat.unreadCount += 1;
                    }
                }
            }
        }

        // Also find all confirmed/completed appointments
        const appointments = await Appointment.find({
            $or: [{ patient: userId }, { doctor: userId }],
            status: { $in: ['confirmed', 'completed'] }
        });

        // Add users from appointments if we haven't seen them yet
        for (const appt of appointments) {
            let otherUserId = appt.patient.toString() === userId.toString() ? appt.doctor.toString() : appt.patient.toString();
            
            if (!seenUsers.has(otherUserId)) {
                seenUsers.add(otherUserId);
                
                const otherUser = await User.findById(otherUserId).select('name email profileImage userType specialization');
                if (otherUser) {
                    chatList.push({
                        user: otherUser,
                        lastMessage: null, // No message sent yet
                        unreadCount: 0
                    });
                }
            }
        }

        res.json(chatList);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ message: 'Server error while fetching recent chats' });
    }
};

// @desc    Mark messages from a specific user as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markMessagesAsRead = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        const result = await Message.updateMany(
            { sender: otherUserId, receiver: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error while updating messages' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getRecentChats,
    markMessagesAsRead
};
