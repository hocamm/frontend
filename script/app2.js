const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const sendButton = document.getElementById("send-content");
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

      // roomID 로컬 스토리지에 저장해서 사용해요
      localStorage.setItem("roomId", userroomid);

      socket.onmessage = function (event) {
        let response = JSON.parse(event.data);

        if (response.type === "machine") {
          console.log("Hocam said: ", response.answer);
          document.getElementById("chatbox").innerHTML +=
            "<p><strong>hocam:</strong> " + response.answer + "</p>";

          // Check if grammarCorrection property exists
          if (response.grammarCorrection) {
            let grammarfix = JSON.parse(response.grammarCorrection);
            // Check if grammarFixedOutput property exists
            if (grammarfix[1] && grammarfix[1].grammarFixedOutput) {
              let correctedSentence =
                grammarfix[1].grammarFixedOutput.split("\"")[1] + ".";
              console.log(grammarfix[1].grammarFixedOutput  );
              document.getElementById("chatbox").innerHTML +=
                "<p><strong>이렇게 말하는 것이 더 좋아요:</strong> " +
                correctedSentence +
                "</p>";
            }
          }
        }
      };

      socket.onerror = function (error) {
        console.error("WebSocket Error: ", error);
      };

      socket.onclose = function (event) {
        console.log("WebSocket is closed now.", event);
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

// 인식 어떻게하는지 로직
// 콤마 찍고 물음표 찍을라면 이걸로 핸들링 해야해요
let interimTranscript = "";

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcriptText = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      interimTranscript += transcriptText;
    }
  }

  // 사용자가 계속 말하고 있을수도 있어서 interimTranscript 최신화 하는 기능
  if (interimTranscript) {
    transcript.value = interimTranscript;
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
  // 위에서 로컬스토리지에 저장했던 roomID 가져와요
  const roomId = localStorage.getItem("roomId");

  // 챗박스에 사용자 input 붙여넣는거
  const message = transcript.value;
  document.getElementById("chatbox").innerHTML +=
    "<p><strong>You:</strong> " + message + "</p>";

  // send 버튼 눌러야만 서버로 보내져요
  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log("You Said: ", message);

  transcript.value = ""; // 메세지 박스 비워서 뒤에 연결되지 않게 해요
});

recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
};
