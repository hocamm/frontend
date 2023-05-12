const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const sendButton = document.getElementById("send-content")
const transcript = document.getElementById("transcript");

let recognition;
let isRecording = false;
let socket;

function getRoomId() {
  return $.ajax({
    url: "http://43.200.123.232:8080/chat",
    method: "POST",
    data: {},
  })
    .done(function (data) {
      socket = new WebSocket(`ws://43.200.123.232:8080/ws/chat`);
      console.log(data);

      let userroomid = data.data.roomId;

      // Save roomId in Local Storage
      localStorage.setItem("roomId", userroomid);

      socket.onmessage = function (event) {
        console.log("Received: ", event.data);
      };

      socket.onerror = function (error) {
        console.error("WebSocket Error: ", error);
      };

      socket.onclose = function (event) {
        console.log("WebSocket is closed now.");
      };
    })
    .fail(function (error) {
      console.error("Error:", error);
    });
}

getRoomId();


if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "tr-TR";
} else {
  console.error("Speech Recognition API not supported by this browser.");
}

startButton.addEventListener("click", () => {
  if (!recognition) return;

  isRecording = true;
  recognition.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});


// recognition handling
let interimTranscript = "";

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      interimTranscript += transcript;
    }
  }
  
  // If there is interimTranscript available, update the transcript's text content
  if(interimTranscript) {
    transcript.textContent = interimTranscript;
  }
};

stopButton.addEventListener("click", () => {
  if (!recognition || !isRecording) return;

  recognition.stop();
  isRecording = false;
  startButton.disabled = false;
  stopButton.disabled = true;

  interimTranscript = "";
});

sendButton.addEventListener("click", () => {
  // Retrieve roomId from Local Storage
  const roomId = localStorage.getItem("roomId");
  // Send the content of the transcript when the recording is stopped
  socket.send(JSON.stringify({ roomId, content: transcript.textContent }));

})

recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
};

