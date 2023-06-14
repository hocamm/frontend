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

// WebSocket 객체 생성
let socket = new WebSocket("wss://www.hocam.kr/ws/chat");

// socket에 대한 event를 핸들링 하는 함수
function SocketEventHandlers() {
  socket.onopen = function () {
    if (selectedTopic !== "자유 주제") {
      sendButton.prop("disabled", true);
      $("#chatbox").append(
        "<div class='message-container machine'>" +
          "<div class='message-container machine thinking'>" +
          "<div class='message machine'>" +
          "호잠이 답변중입니다 ......" +
          "</div>" +
          "</div>" +
          "</div>"
      );
      let roomId = localStorage.getItem("roomId");
      socket.send(
        JSON.stringify({
          roomId,
          content: "Ben " + selectedTopic + " hakkında konuşmak istiyorum",
        })
      );
    }
  };
  socket.onmessage = function (event) {
    if (event.data == "ping") {
      let ping = event.data;
      console.log(ping);
    } else if (event.data != "ping") {
      let response = JSON.parse(event.data);
      let userInput = response;
      let answer = response.answer;
      let message = socket.lastMessage;
      let FixedAnswer = response.grammarFixedAnswer;
      let isRight = response.isRight;
      let answerReason = response.grammarFixedReason;
      let answerReasonTrans = response.translatedReason;
      let reasons = answerReason + "<br>" + "(" + answerReasonTrans + ")";
      let answerTrans = response.transAnswer;
      let grammarCorrectionElement;

      function pushStudylog() {
        studyLogs.push({
          userInput: message,
          fixedAnswer: FixedAnswer.substring(14),
          reason: reasons,
        });
      }

      if (response.type === "machine") {
        $(".message-container.machine.thinking").remove();
        stopThinkingAnimation();
        scrollToBottom();
        console.log(message);
        console.log(response);

        // 조건에 따라 정답 판별
        if (message != undefined && isRight === "true") {
          grammarCorrectionElement =
            "<div class='message-container machine grammarcorrection'>" +
            "<div class='message machine grammarcorrection right'><strong>✔ 완벽해요</strong></div>" +
            "<div class='message user'>" +
            message +
            "</div>" +
            "<div class= 'message machine grammarcorrection'><strong>자연스럽게 표현했어요</strong></div>" +
            "</div>";
        } else if (message != undefined && isRight === "false") {
          console.log(answerReason);
          if (
            (answerReason.includes("Bu cümle doğru") ||
              answerReason.includes(
                "Bu cümle dilbilgisi açısından doğru görünüyor"
              ) ||
              answerReason.includes(
                "Bu cümlede herhangi bir yazım, dilbilgisi veya noktalama hatası yoktur"
              ) ||
              answerReason.includes(
                "Metinde herhangi bir yazım, dilbilgisi veya noktalama hatası yok"
              )) == false
          ) {
            pushStudylog();
            console.log(studyLogs);
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
              reasons +
              "</div>" +
              "</div>" +
              "</div>";
          } else if (
            answerReason.includes("Bu metinde herhangi bir hata yoktur") ||
            answerReason.includes("Metindeki cümleler doğru yazılmıştır") ||
            answerReason.includes("Cümle doğru") ||
            answerReason.includes("Bu cümle doğru") ||
            answerReason.includes(
              "Bu cümle dilbilgisi açısından doğru görünüyor"
            ) ||
            answerReason.includes(
              "Bu cümlede herhangi bir yazım, dilbilgisi veya noktalama hatası yoktur"
            ) ||
            answerReason.includes(
              "Metinde herhangi bir yazım, dilbilgisi veya noktalama hatası yok"
            )
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
              "<button class='ttsBtn' id='ttsBtn'>" +
              "<span class='material-icons'>volume_up</span>" +
              "</button>" +
              "<button class='translateBtn'>" +
              "<span class='material-icons'>translate</span>" +
              "</button>" +
              "</div>" +
              "<span class='translation' style='display:none'>" +
              answerTrans +
              "</span>" +
              "</div>" +
              "</div>" +
              "</div>"
          );
          scrollToBottom();
        }, 1000);
        sendButton.prop("disabled", false);
      }
    }
  };

  socket.onerror = function (errors) {
    alert("호잠에 문제가 생겼습니다. 다시 시도해 주세요", errors);
    sendButton.prop("disabled", true);
    error = true;
    sendStudyLogs();
    socket.close();
    window.location.href = "home.html";
  };

  socket.onclose = function (event) {
    if (event.code == 1011) {
      console.log("WebSocket is closed now.", event);
      alert("호잠이 답하기 어려운 질문이 제시되어 종료됩니다.");
      sendStudyLogs();
      error = true;
      window.location.href = "home.html";
    } else {
      console.log("WebSocket is closed now.", event);
      window.location.href = "home.html";
    }
  };
}
getRoomId().then(SocketEventHandlers);

$(document).on("click", ".translateBtn", function (e) {
  var target1 = $(e.target);
  var target2 = $(e.target.parentElement)
    .closest(".translation-container")
    .find(".translation");
  target2.toggle(300, function () {
    if ($(this).is(":visible")) {
      target1.css("color", "#454545");
    } else {
      target1.css("color", "#858585");
    }
  });
});

// TTS 버튼 동작
function fetchTTS(text) {
  return fetch("https://tts-afih67jd3q-uc.a.run.app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    xhrFields: {
      withCredentials: true,
    },
    body: JSON.stringify({ text }),
  })
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve) => {
        playAudio(arrayBuffer, resolve);
      });
    });
}

function playAudio(arrayBuffer, resolve) {
  const audio = new Audio(URL.createObjectURL(new Blob([arrayBuffer])));
  audio.addEventListener("ended", () => {
    resolve(); // 재생이 완료되면 Promise를 해결(resolve)합니다.
  });
  audio.play();
}

$(document).on("click", ".ttsBtn", function () {
  let ttsButton = $(this);
  ttsButton.css("color", "#454545");

  let answerForTts = ttsButton
    .closest(".message-container.machine")
    .find(".message.machine .answer")
    .text();

  fetchTTS(answerForTts)
    .then(() => {
      ttsButton.css("color", "#858585");
    })
    .catch((error) => {
      console.error("TTS Error:", error);
      ttsButton.css("color", "red");
    });
});

//hocam 로고를 눌렀을 때 경고 알림
$(document).ready(function () {
  $("#mainlogo").click(function () {
    alert(
      "학습이 종료되기 전까지는 페이지를 나갈 수 없습니다. 학습 종료하기를 눌러 학습을 마쳐주세요"
    );
  });
});

// speech recognition 핸들링
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "tr-TR";
} else {
  console.error(
    "이 브라우저는 STT 인식 기능을 지원하지 않습니다. 다른 브라우저를 사용해 주세요."
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
  confirm(
    "정말 종료하시겠습니까? \n(틀린 문장들만 학습 기록에 저장되고, 복습할 수 있습니다.)"
  );
  sendStudyLogs();
  socket.close();
  location.href = "./home.html";
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
    sendButton.prop("disabled", true);
  }

  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log(request);

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
  if (sendButton.prop("disabled") != true) {
    if (event.which === 13) {
      startButton.prop("disabled", false);
      stopButton.prop("disabled", true);
      event.preventDefault();
      sendText();
      changeImgStop();
    }
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

let thinkingAnimationInterval;

function stopThinkingAnimation() {
  clearInterval(thinkingAnimationInterval);
}

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
  console.log(data.studyLogs[0].userInput);
  console.log(data.studyLogs.length);
  if (data.studyLogs.length > 0) {
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
        sessionStorage.clear();
      })
      .fail(function (error) {
        console.error("에러:", error);
      });
  }
}
