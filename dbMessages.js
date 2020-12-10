import mongoose from "mongoose";


const chatSchema = mongoose.Schema({
    name: String,
    message: String,
    timestamp: String,
    received: Boolean,
    room: String,
});

export default mongoose.model('Chats', chatSchema);