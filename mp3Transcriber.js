
async function convertOpusToMp3(opusFilePath, mp3FilePath) {
    try {
      // Ensure ffmpeg is installed. You can replace this check with error handling 
      // if you're certain ffmpeg is available.
      await exec('ffmpeg -version'); 
  
      // Construct the ffmpeg command
      const command = `ffmpeg -i "${opusFilePath}" "${mp3FilePath}"`;
  
      // Execute the command
      await exec(command);
  
      console.log(`Successfully converted ${opusFilePath} to ${mp3FilePath}`);
    } catch (error) {
      console.error(`Error converting audio: ${error.message}`);
    }    };

  async function transcribeMp3(mp3FilePath) {
    try {
      // Initialize OpenAI client (replace with your actual API key)
      //const openaiClient = new openai.OpenAI({ apiKey: 'YOUR_OPENAI_API_KEY' });
  
      // Read the MP3 file content
      const audioFile = fs.readFileSync(mp3FilePath);
  
      // Create transcription using Whisper
      const response = await openai.audio.transcriptions.create({
        file: audioFile, 
        model: 'whisper-1',
        language: 'pt-br',
      });
  
      console.log('Transcription:', response.text);
    } catch (error) {
      console.error('Transcription error:', error.message);
    }
  };
  


module.exports = forwardAudioMessage;