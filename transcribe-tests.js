const fs = require('fs');
const { OpenAI, toFile } = require('openai');
const openai = new OpenAI({apiKey: ''});


async function transcribeMp3(mp3FilePath) {
  try {
    // const audioFile = await toFile(Buffer.from(mp3FilePath), mp3FilePath); // Audio Format Invalid 
    // const buffer = fs.readFileSync(mp3FilePath) // Could not parse multipart form
    const audio = fs.createReadStream(mp3FilePath)

    const response = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'pt',
    });
    console.log('Transcription:', response.text);
  } catch (error) {
    console.error('Transcription error:', error.message);
  }
};

transcribeMp3("./temp_audios/PTT-20230308-WA0016.mp3")
