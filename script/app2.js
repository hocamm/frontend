const startButton = $("#start-recording");
const stopButton = $("#stop-recording");
const sendButton = $("#send-content");
const finishButton = $("#finish-studying");
const transcript = $("#transcript");

let recognition;
let isRecording = false;
let waitingForResponse = false;
let error = false;
let studyLogs = [];
let selectedTopic = sessionStorage.getItem("selectedTopic");

if (selectedTopic == null) {
  selectedTopic = "자유 주제";
}

console.log(selectedTopic);

// roomID를 로컬 스토리지에 저장하여 대화를 지속할 수 있게 하는 함수
function getRoomId() {
  return $.ajax({
    url: "https://www.hocam.kr/chat",
    method: "POST",
    data: {},
    xhrFields: {
      withCredentials: true,
    },
  })
    .done(function (data) {
      console.log(data);
      let userroomid = data.data.roomId;
      localStorage.setItem("roomId", userroomid);
    })
    .fail(function (error) {
      console.error("Error:", error);
    });
}

let socket = new WebSocket("wss://www.hocam.kr/ws/chat");

// socket에 대한 event를 핸들링 하는 함수
function SocketEventHandlers() {
  if (socket) {
    socket.onmessage = function (event) {
      let response = JSON.parse(event.data);
      let userInput = response;
      let answer = response.answer;
      let message = socket.lastMessage;
      let FixedAnswer = response.grammarFixedAnswer;
      let isRight = response.isRight;
      let answerReason = response.grammarFixedReason;
      let answerReasonTrans = response.translatedReason;
      let grammarCorrectionElement;

      if (response.type === "machine") {
        console.log("호잠:", answer);
        console.log(message);
        console.log(userInput);

        $(".message-container.machine.thinking").remove();
        stopThinkingAnimation();
        scrollToBottom();

        // 조건에 따라 정답 판별
        if (isRight === "false") {
          studyLogs.push({
            userInput: message,
            fixedAnswer: FixedAnswer.substring(14),
            reason: answerReasonTrans,
          });

          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection wrong'><strong>✘ 교정이 필요해요 </strong></div>" +
            "<div class='message user'>" +
            message +
            "</div>" +
            "<div class='message machine grammarcorrection wrong'>👉 이렇게 말해봐요:  " +
            FixedAnswer.substring(13) +
            "</div>" +
            "<div class='message machine grammarcorrection'><strong>💡</strong> " +
            answerReasonTrans +
            "</div>" +
            "</div>";
        } else if (isRight === "true") {
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
              "<div class='answer'>" +
              answer +
              "</div>" +
              "<div class='translation-container'>" +
              "<div class='tts-translate-buttons'>" +
              "<button class='ttsBtn'>" +
              "<span class='material-icons'>volume_up</span>" +
              "</button>" +
              "<button class='translateBtn'>" +
              "<span class='material-icons'>translate</span>" +
              "</button>" +
              "</div>" +
              "<span class='translation' style='display:none'>" +
              answerReasonTrans +
              "</span>" +
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
      sendStudyLogs();
    };

    socket.onclose = function (event) {
      console.log("WebSocket is closed now.", event);
      alert(
        "오류가 생겼습니다. 새로고침 해주세요. 지금까지 학습된 내용은 저장됩니다."
      );
      sendButton.prop("disabled", true);
      error = true;
      sendStudyLogs();
    };
  }
}

$(document).on("click", ".translateBtn", function () {
  $(".translation").toggle(800, function () {
    if ($(".translation").is(":visible")) {
      $(".translateBtn").css("color", "#454545");
    } else {
      $(".translateBtn").css("color", "#858585");
    }
  });
});

// tts 기능
// let voices = window.speechSynthesis.getVoices();
// let turkishVoices = voices.filter(voice => voice.lang === "tr-TR");
// let utterance = new SpeechSynthesisUtterance();
// utterance.voice = turkishVoices[0];
// utterance.lang = "tr-TR";

// utterance.onstart = function () {
//   $(".ttsBtn .material-icons").text("volume_up");
// };

// utterance.onend = function () {
//   $(".ttsBtn .material-icons").text("volume_off");
// };

// $(document).on("click", ".ttsBtn", function () {
//   let answerForTts = $(this)
//     .closest(".message-container.machine")
//     .find(".message.machine .answer")
//     .text();
//   utterance.text = answerForTts;
//   console.log(utterance.text);
//   console.log(utterance);
//   window.speechSynthesis.speak(utterance);
// });

//hocam 로고를 눌렀을 때 경고 알림
$(document).on("click", ".hocamBtn", function () {
  alert("학습이 종료되기 전까지는 페이지를 나갈 수 없습니다.");
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
    sendStudyLogs();
    // location.href = "./home.html";
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
  $("#recording-btn").attr("src", "images/stop-recording.png");
}

function changeImgStop() {
  $("#recording-btn").attr("src", "images/start-recording.png");
}

function sendStudyLogs() {
  const data = {
    studyLogs: studyLogs,
    topic: selectedTopic,
  };
  console.log(data);

  $.ajax({
    url: "https://www.hocam.kr/study",
    method: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    xhrFields: {
      withCredentials: true,
    },
  })
    .done(function () {
      console.log("공부 기록 저장 완료.");
      console.log(JSON.stringify(data));
      sessionStorage.clear();
    })
    .fail(function (error) {
      console.error("에러:", error);
    });
}


function fetchTTS(text) {
  fetch(
    "https://example.googleapis.com/v1/fictitiousApiMethod?key=AIzaSyDJjjGLu3DXYnZFDNkWzykZDU6KIXmN3S4",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "tr-TR", name: "tr-TR-Standard-A" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  )
    .then((response) => response.json())
    .then(({ audioContent }) => playAudio(audioContent));
    $(".ttsBtn .material-icons").text("volume_off");
}

function playAudio(audioContent) {
  const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
  audio.play();
}

(document).on("click", ".ttsBtn", function () {
  $(".ttsBtn .material-icons").text("volume_up");
  let answerForTts = $(this)
    .closest(".message-container.machine")
    .find(".message.machine .answer")
    .text();

  fetchTTS(answerForTts);
});
