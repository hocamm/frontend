const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const transcript = document.getElementById("transcript");

let recognition;
let isRecording = false;

// Create a new SpeechRecognition object
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true; // Enable continuous recognition
  recognition.interimResults = true; // Enable interim results
  recognition.lang = "tr-TR"; // Set the language
} else {
  console.error("Speech Recognition API not supported by this browser.");
}

startButton.addEventListener("click", () => {
  if (!recognition) return;

  isRecording = true;
  recognition.start(); // Start recognition
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  if (!recognition || !isRecording) return;

  recognition.stop(); // Stop recognition
  isRecording = false;
  startButton.disabled = false;
  stopButton.disabled = true;
});

recognition.onresult = (event) => {
  let interimTranscript = "";
  let finalTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript;
    } else {
      interimTranscript += transcript;
    }
  }

  transcript.textContent = finalTranscript || interimTranscript;
};

recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
};
