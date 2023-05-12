const startButton = document.getElementById("start-recording");
const stopButton = document.getElementById("stop-recording");
const transcript = document.getElementById("transcript");
const playbackButton = document.getElementById("playback");

let mediaRecorder;
let audioChunks = [];

const API_KEY = "AIzaSyDJjjGLu3DXYnZFDNkWzykZDU6KIXmN3S4";

// 녹음 시작 버튼
startButton.addEventListener("click", async () => {
  try {
    startButton.disabled = true;
    stopButton.disabled = false;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    // Modify the start method call here
    mediaRecorder.start(1000); // Emit dataavailable events every 1000ms (1 second)

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
      const response = await sendAudioToGoogleSTT(blob);
      displayTranscription(response);
    });
      
  } catch (error) {
    console.error("Error starting recording:", error);
    startButton.disabled = false;
  }
});


// 녹음 종료 버튼
stopButton.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;

  mediaRecorder.stop();

  console.log(audioChunks); // Log the audioChunks array

  if (audioChunks.length === 0) {
    console.error("No audio chunks available");
    return;
  }

  const audioBlob = audioChunks[0];

  console.log(audioBlob.size); // Should be greater than 0
  console.log(audioBlob.type); // Should be 'audio/webm; codecs=opus'

  // Blob을 GoogleSTT로 전송
  const response = await sendAudioToGoogleSTT(audioBlob);
  displayTranscription(response);
  
  // 시작 버튼 활성화
  startButton.disabled = false;
});




// 다시 듣기 버튼
playbackButton.addEventListener("click", () => {
  if (audioChunks.length === 0) {
    console.error("No audio to play back.");
    return;
  }

  const audioBlob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
  const audioURL = URL.createObjectURL(audioBlob);
  const audioElement = new Audio(audioURL);

  // 다시 듣기 전 녹음된 파일 저장할때 까지 대기
  audioElement.addEventListener("loadedmetadata", () => {
    audioElement.play();
  });

  // 다시 듣기 에러 로깅
  audioElement.addEventListener("error", (event) => {
    console.error("Playback error:", event);
  });

  // 녹음 내용 초기화
  audioElement.addEventListener("ended", () => {
    audioChunks = [];
  });
});

// 음성 파일 API 전송
async function sendAudioToGoogleSTT(blob) {
  try {
    let base64Audio = await blobToBase64(blob);
    const payload = {
      config: {
        encoding: "WEBM_OPUS",
        languageCode: "tr-TR",
      },
      audio: {
        content: base64Audio,
      },
    };
    console.log(payload); // Log the payload

    const response = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Google STT API responded with an error:", errorResponse);
      return;
    }

    const jsonResponse = await response.json();
    console.log("Raw STT API response:", jsonResponse); // api 응답 로깅
    return jsonResponse;
  } catch (error) {
    console.error("Error sending audio to Google STT:", error);
  }
}

// Blob 을 base64로 변환
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      console.log(base64data); // Log the base64 data
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// api통신으로부터 온 response를 화면에 display함
function displayTranscription(response) {
  try {
    if (!response) {
      console.error("No response from Google STT");
      return;
    }

    if (!response.results || response.results.length === 0) {
      console.error("No transcription results in the API response:", response);
      return;
    }

    const transcribedText = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    transcript.textContent = transcribedText;
  } catch (error) {
    console.error("Error displaying transcription:", error);
  }
}
