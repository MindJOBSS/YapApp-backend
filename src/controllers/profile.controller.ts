import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { User } from "../database/models/user.model";
import cloudinary from "../cloudinary/cloudinary.config";

const updateProfilePicture = expressAsyncHandler(async (req: Request, res: Response):Promise<void> => { 
    const { profilePic } = req.body;
    if (!profilePic) {
        res.status(400).json({ message: "Profile picture is required" });
        return;
    }
    if (profilePic.length > 10_000_000) {
      res
        .status(413)
        .json({ message: "Image too large. Please upload a file under 10MB." });
      return;
    }
      
    const email = req.email;
    const id = req.id;
    if (!email) {
        res.status(401).json({ message: "Unauthorized: Email not found in request" });
        return;
    }
    const user = await User.findOne({ email }).lean().exec();
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    const uploadedProfilePic = await cloudinary.uploader.upload(profilePic);
    if (!uploadedProfilePic || !uploadedProfilePic.secure_url) {
        res.status(500).json({ message: "Failed to upload profile picture" });
        return;
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { profilePic: uploadedProfilePic.secure_url },
        { new: true, runValidators: true }
    ).lean().exec();

    res.status(200).json({
        message: "Profile picture updated successfully",
        user: {
            id: updatedUser?._id,
            email: updatedUser?.email,
            fullName: updatedUser?.fullName,
            profilePic: updatedUser?.profilePic,
        },

    })
    return
 })




export {updateProfilePicture}