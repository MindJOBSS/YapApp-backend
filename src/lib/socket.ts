import { Server } from "socket.io";
import http from "http"
import express from "express"
import { allowedOrigins } from "../config/allowedOrigins";


const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin : allowedOrigins,
    }
})

export const getReceiverSocketId = (userId : string) => {
    return userSocketMap[userId]
}

const userSocketMap: { [userId: string]: string } = {};


io.on("connection", socket => {
    console.log("A user has connected", socket.id)

    const userId = socket.handshake.query.userId
    if (userId) {
        userSocketMap[userId as string] = socket.id
    }
    
    io.emit("getOnlineUsers" , Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("A user has disconnected", socket.id);
        delete userSocketMap[userId as string]
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})




export {app , io , server}