const startButton = $("#start-recording");
const stopButton = $("#stop-recording");
const sendButton = $("#send-content");
const finishButton = $("#finish-studying");
const transcript = $("#transcript");

let recognition;
let isRecording = false;
let socket;
let waitingForResponse = false;
let error = false;

// roomID를 로컬 스토리지에 저장하여 대화를 지속할 수 있게 하는 함수
function getRoomId() {
  socket = new WebSocket("wss://www.hocam.kr/ws/chat");

  socket.onopen = function (event) {
    console.log("Connected to the WebSocket server", event);
    // 여기에서 서버에 메시지를 보내거나 다른 동작을 수행할 수 있습니다.
  };

  socket.onmessage = function (event) {
    console.log("Received data from the WebSocket server", event.data);
    let userroomid = event.data.roomId;
    // roomID 로컬 스토리지에 저장해서 사용해요
    localStorage.setItem("roomId", userroomid);

    // 이곳에서 서버로부터 수신한 데이터를 처리할 수 있습니다.
    // 예를 들어, room ID를 로컬 스토리지에 저장하는 것이 있습니다.
  };

  socket.onerror = function (error) {
    console.error("Error occurred with the WebSocket connection", error);
  };

  socket.onclose = function (event) {
    console.log("WebSocket connection closed", event);
  };
}

// socket에 대한 event를 핸들링 하는 함수
function SocketEventHandlers() {
  if (socket) {
    socket.onmessage = function (event) {
      let response = JSON.parse(event.data);
      let userInput = response;
      let answer = response.answer;
      let message = socket.lastMessage;
      let FixedAnswer = response.grammarFixedAnswer;
      let answerReason = response.grammarFixedReason;
      let answerReasonTrans = response.translatedReason;
      let grammarCorrectionElement;

      if (response.type === "machine") {
        console.log("호잠:", answer);
        console.log(message);
        console.log(userInput);
        console.log(message);
        console.log("정답:", FixedAnswer.substring(14));
        console.log("문장 분석:", answerReason);

        $(".message-container.machine.thinking").remove();
        stopThinkingAnimation();
        scrollToBottom();

        // 조건에 따라 정답 판별
        if (answerReason.includes("Doğru cümle şu şekilde olmalıdır")) {
          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection wrong'><strong>✘ 교정이 필요해요 </strong></div>" +
            "<div class='message user'><strong>You:</strong> " +
            message +
            "</div>" +
            "<div class='message machine grammarcorrection wrong'>👉 이렇게 말해봐요:  " +
            FixedAnswer.substring(13) +
            "</div>" +
            "<div class='message machine grammarcorrection'><strong>💡</strong> " +
            answerReasonTrans +
            "</div>" +
            "</div>";
        } else if (
          answerReason.includes("doğru") ||
          answerReason.includes("doğrudur") ||
          FixedAnswer.includes("doğru") ||
          FixedAnswer.includes("doğrudur") ||
          FixedAnswer.includes("맞습니다") ||
          FixedAnswer.includes("yanlışlık yok")
        ) {
          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection right'><strong>✔ 완벽해요</strong></div>" +
            "<div class='message user'>" +
            message +
            "</div>" +
            "<div class= 'message machine grammarcorrection'><strong>자연스럽게 표현했어요</strong></div>" +
            "</div>";
        }
        scrollToBottom();

        // message, grammarcorrection 같은 컨테이너 안에 넣음
        $(".message-container.user:last").html(grammarCorrectionElement);
        scrollToBottom();
        setTimeout(function () {
          $("#chatbox").append(
            "<div class='message-container machine'>" +
              "<div class='message machine'>" +
              answer +
              "<div class='translation-container'>" +
              "<button class='translateBtn'>번역</button>" +
              "<span class='translation' style='display:none'>" +
              answerReasonTrans +
              "</span>" +
              "</div>" +
              "<div class='tts-conatiner'" +
              "<button class='ttsBtn'>tts</button>" +
              "</div>" +
              "</div>" +
              "</div>"
          );
          scrollToBottom();
        }, 1000);
      }
    };

    socket.onerror = function (errors) {
      alert("호잠에 문제가 생겼습니다. 새로고침 해주세요", errors);
      sendButton.prop("disabled", true);
      error = true;
    };

    socket.onclose = function (event) {
      console.log("WebSocket is closed now.", event);
      alert(
        "오류가 생겼습니다. 새로고침 해주세요. 지금까지 학습된 내용은 저장됩니다."
      );
      sendButton.prop("disabled", true);
      error = true;
    };
  }
}

$(document).on("click", ".translateBtn", function () {
  $(this).next(".translation").toggle();
});

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

let punctuation = false;
let interimTranscript = "";
let finalTranscript = "";

recognition.onresult = (event) => {
  let interimTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcriptText = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcriptText + "";
      punctuation = false;
      if (
        !punctuation &&
        (transcriptText.trim().startsWith("Neyin") ||
          transcriptText.trim().startsWith("Niçin") ||
          transcriptText.trim().startsWith("Nerede") ||
          transcriptText.trim().startsWith("Ne zaman") ||
          transcriptText.trim().startsWith("Nasıl") ||
          transcriptText.trim().endsWith("mi") ||
          transcriptText.trim().endsWith("mü") ||
          transcriptText.trim().endsWith("mı") ||
          transcriptText.trim().endsWith("mu") ||
          transcriptText.trim().endsWith("nasılsınız") ||
          transcriptText.trim().endsWith("nasılsın") ||
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
          transcriptText.trim().endsWith("mısınız") ||
          transcriptText.trim().endsWith("nedir"))
      ) {
        finalTranscript += "?";
        punctuation = true;
      } else if (
        !punctuation &&
        (transcriptText.trim().endsWith("Merhaba") ||
          transcriptText.trim().endsWith("merhaba") ||
          transcriptText.trim().endsWith("salam") ||
          transcriptText.trim().endsWith("Salam"))
      ) {
        finalTranscript += "!";
        punctuation = true;
      } else if (!punctuation) {
        finalTranscript += ".";
        punctuation = true;
      }
    } else {
      interimTranscript += transcriptText;
    }
  }

  // finalTranscript와 동시에 interimTranscript 출력
  transcript.val(finalTranscript + interimTranscript);
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

finishButton.on("click", () => {
  if (confirm("정말 종료하시겠습니까?")) {
    location.href = "./home.html";
  }
});
// sendText는 엔터치거나 send 누르면 보내짐
function sendText() {
  // 로컬스토리지에서 roomId fetch
  const roomId = localStorage.getItem("roomId");

  // chatbox에 transcript 된 user input 넣음
  const message = transcript.val();
  socket.lastMessage = message;

  // sendbox가 비어있으면 alert
  if (!message.trim()) {
    alert("하고싶은 말을 적어주세요");
    return;
  }
  if (error != true) {
    $("#chatbox").append(
      "<div class='message-container user'><p class='message user'>" +
        message +
        "</p></div>"
    );

    startButton.prop("disabled", false);
    stopButton.prop("disabled", true);
  }

  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log("You Said: ", message);

  transcript.val(""); // user input이 transcript에 계속되지 않게 비워줌
  finalTranscript = ""; // finalTranscript도 같이 비워줌

  // 호잠이 생각할 시간을 줌
  setTimeout(() => {
    if (error != true) {
      $("#chatbox").append(
        "<div class='message-container machine thinking'><p class='message machine thinking'>" +
          "." +
          "</p></div>"
      );
    }
    setTimeout(startThinkingAnimation, 0);
  }, 1500);
  scrollToBottom();
}

// send 버튼 click시 sendtext 실행
sendButton.on("click", sendText);

// transcript에 enter 눌렸을 때 sendtext 실행

transcript.on("keypress", (event) => {
  if (event.which === 13) {
    startButton.prop("disabled", false);
    stopButton.prop("disabled", true);
    event.preventDefault();
    sendText();
    changeImgStop();
  }
});

// 스크롤 자동으로 밑으로 내림
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
  }, 600);
}

function stopThinkingAnimation() {
  clearInterval(thinkingAnimationInterval);
}

// 클릭시 녹음 모양 아이콘 변함
function changeImgStart() {
  $("#recording-btn").attr("src", "../images/stop-recording.png");
}

function changeImgStop() {
  $("#recording-btn").attr("src", "../images/start-recording.png");
}
