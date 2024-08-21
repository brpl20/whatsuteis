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

const archiveGroup = require('./archiveGroup');

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const authOptions = {
  dataPath: './prof'
};

const client = new Client({
  authStrategy: new LocalAuth(authOptions),
  puppeteer: {
    headless: true
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('error', (error) => {
  console.error('An error occurred:', error);
});

let rawdata = fs.readFileSync('settings.json');
let data = JSON.parse(rawdata);
let groupsToArchive = data.groupsToArchive;
let spamToArchive = data.spamToArchive;

async function convertOpusToMp3(opusFilePath, mp3FilePath) {
  try {
    await exec('ffmpeg -version'); 
    const command = `ffmpeg -i "${opusFilePath}" "${mp3FilePath}"`;
    await exec(command);
    console.log(`Successfully converted ${opusFilePath} to ${mp3FilePath}`);
  } catch (error) {
    console.error(`Error converting audio: ${error.message}`);
  }
}

async function transcribeMp3(mp3FilePath) {
  try {
    const audio = fs.createReadStream(mp3FilePath)
    const response = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'pt',
    });
    console.log('Transcription:', response.text);
    return response.text
  } catch (error) {
    console.error('Transcription error:', error.message);
  }
}

function isMessageRead(message) {
  return message._data.viewed;
}

async function forwardAudioMessage(message) {
  if (!message.from.endsWith('@g.us') && message.type === 'ptt') {
    setTimeout(async () => {
      if (!isMessageRead(message)) {
        message.reply('🤖 Eu sou o Robô do Bruno 🤖\n\nVou transcrever seu áudio:');
      
        try {
          const media = await message.downloadMedia();
          console.log(media)
          const extension = mime.extension(media.mimetype);
          const filename = `./temp_audios/${uuidv4()}.${mime.extension(media.mimetype)}`;
          fs.writeFileSync(filename, media.data, 'base64');
          await convertOpusToMp3(filename, `${filename}.mp3`);
          let audio_transcribe = await transcribeMp3(`${filename}.mp3`)
          message.reply(audio_transcribe);
        } catch (error) {
          console.error('Error', error.message)
        }
      }
    }, 1);
  }
}

client.on('message', async (message) => {
  await archiveGroup(client, message, groupsToArchive);
  await forwardAudioMessage(message);
});

client.on('message', async (message) => {
  let contact = await message.getContact()
  if (contact.isMyContact) {
    if (spamToArchive.includes(message.from)) {  
      try {
        let chat = await client.getChatById(message.from);
        await chat.archive();
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  } else {
    // TD: 
    // Create a filter for new messages that is not me, is not my contact
    // Check if it is spam with openai request
    // Mark as SPAM 
  }
});

client.on('message_create', async (msg) => {
  const lembretePattern = /^Lembrete: (\d+)$/;
  const match = msg.body.match(lembretePattern);

  if (msg.fromMe && match) {
    const dueDays = parseInt(match[1]);
    const chat = await msg.getChat();
    const chatId = chat.id._serialized;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    try {
      const newMessage = new MessageScheduler({
        chatId,
        messageBody: 'Lembrete',
        dueDate,
      });

      await newMessage.save();
      console.log('Message saved:', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
});

async function checkAndSendMessages() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day

  try {
    const messagesToSend = await MessageScheduler.find({ dueDate: { $lte: today } });

    for (const message of messagesToSend) {
      await client.sendMessage(message.chatId, message.messageBody);
      await MessageScheduler.deleteOne({ _id: message._id });
      console.log('Message sent and deleted:', message);
    }
  } catch (error) {
    console.error('Error checking and sending messages:', error);
  }
}

// Schedule the task to run every working day at 9 AM
cron.schedule('0 9 * * 1-5', () => {
  checkAndSendMessages().catch(error => console.error('Error in cron job:', error));
});

// Week Album
cron.schedule('0 9 * * 1', async () => { // Every Monday at 9:00 AM
  try {
    const jsonData = JSON.parse(fs.readFileSync('discos.json', 'utf8'));
    const randomQuote = jsonData[Math.floor(Math.random() * jsonData.length)];

    const myNumber = await client.getNumberId(); // Get your own WhatsApp ID
    await client.sendMessage("554599761469@c.us", randomQuote);
    console.log('Sent message:', randomQuote);
  } catch (error) {
    console.error('Error:', error);
  }
});

client.initialize();