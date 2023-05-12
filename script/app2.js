const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const transcript = document.getElementById("transcript");

let recognition;
let isRecording = false;

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true; 
  recognition.interimResults = true; 
  recognition.lang = "tr-TR"; 
} else {
  console.error("Speech Recognition 기능은 이 브라우저에서 지원되지 않습니다");
}

startButton.addEventListener("click", () => {
  if (!recognition) return;

  isRecording = true;
  recognition.start(); 
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  if (!recognition || !isRecording) return;

  recognition.stop();
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
