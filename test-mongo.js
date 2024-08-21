const fs = require('fs');
const cron = require('node-cron');
const mime = require('mime-types');
const util = require('util'); 
const exec = util.promisify(require('child_process').exec);
const { OpenAI, toFile } = require('openai');
const openai = new OpenAI({apiKey: ''});
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const uri = "";

mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB connected successfully");
    mongoose.connection.useDb('WhatsAppDb');
  })
  .catch(err => console.error("MongoDB connection error:", err));


  const messageSchema = new mongoose.Schema({
    chatId: String,
    messageBody: String,
    date: { type: Date, default: Date.now },
    dueDate: Date,
  }, { collection: 'messagesscheduler' });
  

  const MessageScheduler = mongoose.model('messagesscheduler', messageSchema);


async function checkAndSendMessages() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day

  try {
    const messagesToSend = await MessageScheduler.find({ dueDate: { $lte: today } });
    console.log(messagesToSend);

    for (const message of messagesToSend) {
      console.log(message)
      await client.sendMessage(message.chatId, message.messageBody);
      await MessageScheduler.deleteOne({ _id: message._id });
      console.log('Message sent and deleted:', message);
    }
  } catch (error) {
    console.error('Error checking and sending messages:', error);
  }
}

checkAndSendMessages()