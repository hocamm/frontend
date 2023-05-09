const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const transcript = document.getElementById("transcript");
const playbackButton = document.getElementById("playback");

playbackButton.addEventListener("click", () => {
    if (audioChunks.length === 0) {
      console.error("No audio to play back.");
      return;
    }
  
    const audioBlob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
    const audioURL = URL.createObjectURL(audioBlob);
    const audioElement = new Audio(audioURL);
  
    // Wait for the media file to load completely before playing it
    audioElement.addEventListener("loadedmetadata", () => {
      audioElement.play();
    });
  
    // Log any playback errors
    audioElement.addEventListener("error", (event) => {
      console.error("Playback error:", event);
    });
  
    // Reset the audioChunks array after playback
    audioElement.addEventListener("ended", () => {
      audioChunks = [];
    });
  });
  

let mediaRecorder;
let audioChunks = [];

// API key for Google Cloud Speech-to-Text
const API_KEY = "AIzaSyDJjjGLu3DXYnZFDNkWzykZDU6KIXmN3S4";

// Start recording
startButton.addEventListener("click", async () => {
  try {
    startButton.disabled = true;
    stopButton.disabled = false;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
        const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
        const response = await sendAudioToGoogleSTT(blob);
        displayTranscription(response);
      });
      
  } catch (error) {
    console.error("Error starting recording:", error);
    startButton.disabled = false;
  }
});

// Stop recording
stopButton.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;

  mediaRecorder.stop();

  const audioBlob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });

  // Send the audioBlob to Google Speech-to-Text API
  const response = await sendAudioToGoogleSTT(audioBlob);
  displayTranscription(response);

  // Re-enable the startButton and reset the audioChunks array
  startButton.disabled = false;
});

// Send audio to Google Speech-to-Text API
async function sendAudioToGoogleSTT(blob) {
  try {
    const response = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            languageCode: "tr-TR",
          },

          audio: {
            content: await blobToBase64(blob),
          },
        }),
      }
    );

    const jsonResponse = await response.json();
    console.log("Raw STT API response:", jsonResponse); // Log the raw response
    return jsonResponse;
  } catch (error) {
    console.error("Error sending audio to Google STT:", error);
  }
}

// Convert Blob to Base64
async function blobToBase64(blob) {
  try {
    const reader = new FileReader();
    const promise = new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
    reader.readAsDataURL(blob);
    return await promise;
  } catch (error) {
    console.error("Error converting blob to base64:", error);
  }
}

// Display transcription
function displayTranscription(response) {
  try {
    if (response.results) {
      const transcribedText = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");
      transcript.textContent = transcribedText;
    } else {
      console.warn(
        "No transcription results found in the API response:",
        response
      );
    }
  } catch (error) {
    console.error("Error displaying transcription:", error);
  }
}
