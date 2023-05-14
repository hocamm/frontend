const startButton = $("#start-recording");
const stopButton = $("#stop-recording");
const sendButton = $("#send-content");
const transcript = $("#transcript");

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

function SocketEventHandlers() {
  if (socket) {
    socket.onmessage = function (event) {
      let response = JSON.parse(event.data);
      if (response.type === "machine") {
        console.log("Hocam said: ", response.answer);
        if (response.grammarCorrection) {
          let grammarfix = JSON.parse(response.grammarCorrection);
          if (grammarfix[1] && grammarfix[1].grammarFixedOutput) {
            let correctedSentence =
              grammarfix[1].grammarFixedOutput.split('"')[1] + ".";
            console.log(grammarfix[1].grammarFixedOutput);
    
            // 고친 문장 기존 채팅 밑에 붙임
            $(".message-container.user:last .message.user").append(
              "<p class='grammarcorrection' style='color: red'><strong>이렇게 말하는 것이 더 좋아요:</strong> " +
                correctedSentence +
                "</p>"
            );
    
            // Remove "thinking" message and stop the animation
            $(".message-container.machine.thinking").remove();
            stopThinkingAnimation();
          }
        }
    
        setTimeout(function() {
          // 응답에 대한 새로운 챗 버블 생성
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
      interimTranscript += transcriptText + ".";
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

sendButton.on("click", () => {
  // 위에서 로컬스토리지에 저장했던 roomID 가져와요
  const roomId = localStorage.getItem("roomId");

  // 챗박스에 사용자 input 붙여넣는거
  const message = transcript.val();
  $("#chatbox").append(
    "<div class='message-container user'><p class='message user'><strong>You:</strong> " +
      message +
      "</p></div>"
  );

  // send 버튼 눌러야만 서버로 보내져요
  const request = JSON.stringify({ roomId, content: message });

  socket.send(request);
  console.log("You Said: ", message);

  transcript.val(""); // 메세지 박스 비워서 뒤에 연결되지 않게 해요

  $("#chatbox").append(
    "<div class='message-container machine thinking'><p class='message machine' style='font-size: 30px'>" +
      "Hocam is thinking." +
      "</p></div>"
  );

  setTimeout(startThinkingAnimation, 0);

  scrollToBottom();
});



// 스크롤 자동으로 밑으로 내림 - test 필요
function scrollToBottom() {
  const chatbox = document.getElementById("chatbox");
  chatbox.scrollTop = chatbox.scrollHeight;
}

let observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      const thinkingMessageElement = document.querySelector(".message-container.machine.thinking .message.machine");
      if (thinkingMessageElement) {
        startThinkingAnimation();
      }
    }
  });
});

observer.observe(document.querySelector('#chatbox'), { childList: true });

function startThinkingAnimation() {
  let count = 0;
  
  thinkingAnimationInterval = setInterval(() => {
    const thinkingMessageElement = document.querySelector(".message-container.machine.thinking .message.machine");
    
    if (thinkingMessageElement) {
      switch (count % 3) {
        case 0:
          thinkingMessageElement.innerText = "Hocam is thinking.";
          break;
        case 1:
          thinkingMessageElement.innerText = "Hocam is thinking..";
          break;
        case 2:
          thinkingMessageElement.innerText = "Hocam is thinking...";
          break;
      }
      count++;
    }
  }, 400);
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
