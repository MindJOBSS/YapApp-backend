import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { User } from "../database/models/user.model";
import { Message } from "../database/models/message.model";
import cloudinary from "../cloudinary/cloudinary.config";
import { getReceiverSocketId, io } from "../lib/socket";


const getallUsers = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => { 
    const id = req.id;
    if (!id) {
        res.status(401).json({ message: "Unauthorized: ID not found in request" });
        return;
    }
    const filteredUsers = await User.find({ _id: { $ne: id } })
        .select("-password").lean().exec()
    
    if (!filteredUsers || filteredUsers.length === 0) { 
        res.status(404).json({ message: "No users found" });
        return;
    }

    res.status(200).json({
        message: "Users retrieved successfully",
        filteredUsers,
    })
    return
})

const getMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => { 
    const id = req.id;
    if (!id) {
        res.status(401).json({ message: "Unauthorized: ID not found in request" });
        return;
    }
    
    const receiverId = req.params.id
    const receiver = await User.findById(receiverId).select("-password").lean().exec();
    if (!receiver) {
        res.status(404).json({ message: "Receiver not found" });
        return;
    }

    const messages = await Message.find({
        $or: [
            { senderId: id, receiverId: receiverId },
            { senderId: receiverId, receiverId: id }
        ],
    }).lean().exec();

    if (!messages || messages.length === 0) {
        res.status(404).json({ message: "No messages found" });
        return;
    }

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages,
    })
    return
})
 
const sendMessage = async (req:Request, res:Response) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

 export { getallUsers, getMessages, sendMessage };