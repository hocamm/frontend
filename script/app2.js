const startButton = $("#start-recording");
const stopButton = $("#stop-recording");
const sendButton = $("#send-content");
const finishButton = $("#finish-studying");
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
      let userInput = response;
      // let isRight = response.isRight;
      let answer = response.answer;
      let message = socket.lastMessage;
      let FixedAnswer = response.grammarFixedAnswer;
      let answerReason = response.grammarFixedReason;
      let answerReasonTrans = response.translatedReason;
      let grammarCorrectionElement;

      if (response.type === "machine") {
        console.log("호잠:", answer);
        console.log(message);
        console.log(userInput)
        console.log(message)
        console.log("정답:", FixedAnswer.substring(14));
        console.log("문장 분석:", answerReason);

        $(".message-container.machine.thinking").remove();
        stopThinkingAnimation();

        // 조건에 따라 정답 판별
        if (
          answerReason.includes("yanlış") ||
          answerReason.includes("Doğru cümle şu şekilde olmalıdır")
        ) {
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
          FixedAnswer.includes("doğrudur")
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

        // message, grammarcorrection 같은 컨테이너 안에 넢음
        $(".message-container.user:last").html(grammarCorrectionElement);
        scrollToBottom();
        setTimeout(function () {
          $("#chatbox").append(
            "<div class='message-container machine'><p class='message machine'>" +
              response.answer +
              "</p></div>"
          );
          scrollToBottom();
        }, 2000);
      }
    };

    socket.onerror = function (error) {
      alert("호잠에 문제가 생겼습니다. 새로고침 해주세요");
    };

    socket.onclose = function (event) {
      console.log("WebSocket is closed now.", event);
      alert(
        "오류가 생겼습니다. 새로고침 해주세요. 지금까지 학습된 내용은 저장됩니다."
      );
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

  $("#chatbox").append(
    "<div class='message-container user'><p class='message user'><strong>You:</strong> " +
      message +
      "</p></div>"
  );

  startButton.prop("disabled", false);
  stopButton.prop("disabled", true);

  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log("You Said: ", message);

  transcript.val(""); // user input이 transcript에 계속되지 않게 비워줌
  finalTranscript = ""; // finalTranscript도 같이 비워줌

  // 호잠이 생각할 시간을 줌
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
  }, 450);
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
