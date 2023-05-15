const startButton = $("#start-recording");
const stopButton = $("#stop-recording");
const sendButton = $("#send-content");
const transcript = $("#transcript");

let recognition;
let isRecording = false;
let socket;

// roomID를 로컬 스토리지에 저장하여 대화를 지속할 수 있게 하는 함수
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

// socket에 대한 event를 핸들링 하는 함수
function SocketEventHandlers() {
  if (socket) {
    socket.onmessage = function (event) {
      let response = JSON.parse(event.data);
      let message = socket.lastMessage;
      if (response.type === "machine") {
        console.log("Hocam said: ", response.answer);
        console.log(response);
        console.log("Grammar Correction: ", response.grammarFixedAnswer);
        console.log("What is wrong: ", response.grammarFixedReason);

        let fullFixedAnswer = response.grammarFixedAnswer;
        let answerReason = response.grammarFixedReason;
        let grammarCorrectionElement;

        // Remove ''
        $(".message-container.machine.thinking").remove();
        stopThinkingAnimation();

        // If 'doğrudur' is included in the corrected answer, append specific message
        if (
          fullFixedAnswer.includes("doğrudur") ||
          fullFixedAnswer.includes("doğru") ||
          answerReason.includes("doğru") ||
          answerReason.includes("doğrudur")
        ) {
          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection right'><strong>✔ 완벽해요</strong></div>" +
            "<div class='message user'>" +
            message +
            "</div>" +
            "<div class= 'message machine grammarcorrection'><strong>자연스럽게 표현했어요</strong></div>" +
            "</div>";
        } else {
          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection wrong'><strong>✘ 교정이 필요해요 </strong></div>" +
            "<div class='message user'><strong>You:</strong> " +
            message +
            "</div>" +
            "<div class='message machine grammarcorrection wrong'>👉 이렇게 말해봐요:  " +
            fullFixedAnswer +
            "</div>" +
            "<div class='message machine grammarcorrection'><strong>💡</strong> " +
            answerReason +
            "</div>" +
            "</div>";
        }

        // Append user message and grammar correction in the same container
        $(".message-container.user:last").html(grammarCorrectionElement);

        // 2000ms after, display it on the screen.
        setTimeout(function () {
          // Create a new chat container for the response.
          $("#chatbox").append(
            "<div class='message-container machine'><p class='message machine'>" +
              response.answer +
              "</p></div>"
          );
          scrollToBottom();
        }, 2000);
      }
    };
  }
}

getRoomId().then(SocketEventHandlers);

// speech recognition 핸들링
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "tr-TR";
} else {
  console.error(
    "이 브라우저는 STT 인식 기능을 하지 않습니다. 다른 브라우저를 사용해 주세요."
  );
}

let interimTranscript = "";
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcriptText = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      // 문장부호 추가를 위한 조건 생성
      if (
        transcriptText.trim().startsWith("Neyin") ||
        transcriptText.trim().startsWith("Niçin") ||
        transcriptText.trim().startsWith("Nerede") ||
        transcriptText.trim().startsWith("Ne zaman") ||
        transcriptText.trim().startsWith("Nasıl") ||
        transcriptText.trim().endsWith("mi") ||
        transcriptText.trim().endsWith("mü") ||
        transcriptText.trim().endsWith("mı") ||
        transcriptText.trim().endsWith("mu") ||
        transcriptText.trim().endsWith("nasılsınız") ||
        transcriptText.trim().endsWith("nasılsln") ||
        transcriptText.trim().endsWith("muyum") ||
        transcriptText.trim().endsWith("musun") ||
        transcriptText.trim().endsWith("musunuz") ||
        transcriptText.trim().endsWith("miyim") ||
        transcriptText.trim().endsWith("misin") ||
        transcriptText.trim().endsWith("misiniz") ||
        transcriptText.trim().endsWith("müyüm") ||
        transcriptText.trim().endsWith("müsün") ||
        transcriptText.trim().endsWith("müsünüz") ||
        transcriptText.trim().endsWith("mıyım") ||
        transcriptText.trim().endsWith("mısın") ||
        transcriptText.trim().endsWith("mısınız")
      ) {
        interimTranscript += transcriptText + "?";
      } else {
        interimTranscript += transcriptText + ".";
      }
    }
  }

  if (interimTranscript) {
    transcript.val(interimTranscript);
  }
};

recognition.onerror = (event) => {
  console.error("Recognition error:", event.error);
};

startButton.on("click", () => {
  if (!recognition) return;

  isRecording = true;
  recognition.start();
  startButton.prop("disabled", true);
  stopButton.prop("disabled", false);
});

stopButton.on("click", () => {
  if (!recognition || !isRecording) return;

  recognition.stop();
  isRecording = false;
  startButton.prop("disabled", false);
  stopButton.prop("disabled", true);

  interimTranscript = "";
});

// sendText는 엔터치거나 send 누르면 보내짐
function sendText() {
  // 위에서 로컬스토리지에 저장했던 roomID 가져와요
  const roomId = localStorage.getItem("roomId");

  // 챗박스에 사용자 입력값을 붙여넣습니다.
  const message = transcript.val();
  socket.lastMessage = message;
  // sendbox 비어있으면 alert
  if (!message.trim()) {
    alert("하고싶은 말을 적어주세요");
    return;
  }

  $("#chatbox").append(
    "<div class='message-container user'><p class='message user'><strong>You:</strong> " +
      message +
      "</p></div>"
  );

  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log("You Said: ", message);

  transcript.val(""); // transcript를 비워서 뒤에 사용자 입력이 이어지지 않게 합니다.

  // Add a delay before appending 'thinking' message.
  setTimeout(() => {
    $("#chatbox").append(
      "<div class='message-container machine thinking'><p class='message machine thinking'>" +
        "." +
        "</p></div>"
    );

    setTimeout(startThinkingAnimation, 0);
    scrollToBottom();
  }, 1500);
}


// send 버튼 click시 sendtext 실행
sendButton.on("click", sendText);

// transcript에 enter 눌렸을 때 sendtext 실행
transcript.on("keypress", (event) => {
  if (event.which === 13) {
    event.preventDefault();
    sendText();
  }
});

// 스크롤 자동으로 밑으로 내림 - test 필요
function scrollToBottom() {
  const chatbox = document.getElementById("chatbox");
  chatbox.scrollTop = chatbox.scrollHeight;
}

// observer 활용하여  동적으로 구현
let observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "childList") {
      const thinkingMessageElement = document.querySelector(
        ".message-container.machine.thinking.message.machine"
      );
      if (thinkingMessageElement) {
        startThinkingAnimation();
      }
    }
  });
});

observer.observe(document.querySelector("#chatbox"), { childList: true });

function startThinkingAnimation() {
  let count = 0;

  thinkingAnimationInterval = setInterval(() => {
    const thinkingMessageElement = document.querySelector(
      ".message-container.machine.thinking .message.machine.thinking"
    );

    if (thinkingMessageElement) {
      switch (count % 3) {
        case 0:
          thinkingMessageElement.innerText = ".";
          break;
        case 1:
          thinkingMessageElement.innerText = ". .";
          break;
        case 2:
          thinkingMessageElement.innerText = ". . .";
          break;
      }
      count++;
    }
  }, 450);
}

function stopThinkingAnimation() {
  clearInterval(thinkingAnimationInterval);
}

// 클릭시 녹음 모양 아이콘 변함
function changeImgStart() {
  document.getElementById("recording-btn").src = "../images/stop-recording.png";
}

function changeImgStop() {
  document.getElementById("recording-btn").src =
    "../images/start-recording.png";
}
