import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Chats from "./dbMessages.js";
import Pusher from "pusher";


// app config
const app = express();
const port = process.env.PORT || 8001;
const connectionUrl = 'mongodb+srv://sanad:Z752b3OGmudG5PBY@cluster0.umigw.mongodb.net/chatsdb?retryWrites=true&w=majority';
const pusher = new Pusher({
  appId: "1118664",
  key: "425c30009cff9e0936e9",
  secret: "6c8072cadadf2b0c58bd",
  cluster: "mt1",
  useTLS: true
});

// middlewares
app.use(express.json());
app.use(cors());

//  still there is no any kind of security but only for test but better to use cors instead
// app.use((req,res,next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// });

// db config
mongoose.connect(connectionUrl, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
});

const db = mongoose.connection;

db.once("open", () => 
{
    console.log("DB connected");

    const msgCollection = db.collection("chats");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        // console.log(change);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                    {
                        name: messageDetails.name,
                        message: messageDetails.message,
                        timestamp: messageDetails.timestamp,
                        received: messageDetails.received,
                        room: messageDetails.room,
                    }
                );
        } else {
            console.log('Error triggering pusher');
        } 
    });
});

// API endpoints
app.get('/', (req, res) => res.status(200).send("Hello bakend World!!!!!"));
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Chats.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});
app.get('/messages/sync', (req, res) => {

    Chats.find({}, (err, data) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

// listener
app.listen(port, (err) => (!err)?console.log(`hello app listening to post: ${port}`):console.log(err));