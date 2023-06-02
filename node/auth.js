const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

exports.textToSpeechFunction = async (req, res) => {
  try {
    const text = req.body.text;
    const request = {
      input: { text },
      voice: { languageCode: 'tr-TR', name: 'tr-TR-Standard-A' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;
    res.status(200).send(audioContent);
  } catch (error) {
    res.status(500).send(error);
  }
};
