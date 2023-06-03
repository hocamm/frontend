window.onload = function () {
  buildCalendar();
  showMain(today.getFullYear(), today.getMonth() + 1, today.getDate());
  $(document).ready(function () {
    $.ajax({
      url: "https://www.hocam.kr/user/info",
      method: "GET",
      xhrFields: {
        withCredentials: true,
      },
      success: function (response) {
        if (response.status === 200) {
          $("#user").text(response.data["nickname"] + "님 학습데이터");
          console.log(response.data);
        }
      },
      error: function (error) {
        console.error("데이터 수신 실패: " + error);
      },
    });
  });
};

let nowMonth = new Date();
let today = new Date();
today.setHours(0, 0, 0, 0);

// 달력 생성 : 해당 달에 맞춰 테이블을 만들고, 날짜 채워 놓음
function buildCalendar() {
  let firstDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1); // 이번달 1일
  let lastDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, 0); // 이번달 마지막 날

  let tbody_Calendar = document.querySelector(".Calendar > tbody");
  document.getElementById("calYear").innerText = nowMonth.getFullYear(); // 연도 숫자 갱신
  document.getElementById("calMonth").innerText = leftPad(
    nowMonth.getMonth() + 1
  ); // 월 숫자 갱신

  while (tbody_Calendar.rows.length > 0) {
    // 이전 출력결과가 남아있는 경우 초기화
    tbody_Calendar.deleteRow(tbody_Calendar.rows.length - 1);
  }

  let nowRow = tbody_Calendar.insertRow(); // 첫번째 행 추가

  for (let j = 0; j < firstDate.getDay(); j++) {
    // 이번달 1일의 요일만큼
    let nowColumn = nowRow.insertCell(); // 열 추가
  }

  for (
    let nowDay = firstDate;
    nowDay <= lastDate;
    nowDay.setDate(nowDay.getDate() + 1)
  ) {
    // day는 날짜를 저장하는 변수, 이번달 마지막날까지 증가시키며 반복

    let nowColumn = nowRow.insertCell(); // 새 열을 추가하고
    nowColumn.innerText = nowDay.getDate(); // 추가한 열에 날짜 입력

    if (nowDay.getDay() == 0) {
      // 일요일인 경우 글자색 빨강으로
      nowColumn.style.color = "#DC143C";
    }
    if (nowDay.getDay() == 6) {
      // 토요일인 경우 글자색 파랑으로
      nowColumn.style.color = "#0000CD";
      nowRow = tbody_Calendar.insertRow(); // 새로운 행 추가
    }

    nowColumn.onclick = function () {
      choiceDate(this);
      showMain(
        nowMonth.getFullYear(),
        nowMonth.getMonth() + 1,
        nowColumn.innerText
      );

      let urldate =
        "https://www.hocam.kr/" +
        "study?year=" +
        nowMonth.getFullYear() +
        "&" +
        "month=" +
        (nowMonth.getMonth() + 1);

      $.ajax({
        url: urldate,
        type: "GET",
        dataType: "json",
        xhrFields: {
          withCredentials: true,
        },
        success: function (response) {
          $("#history-wrap").empty();
          console.log(response.data);
          let selectedDate;
          let selectedMonth;
          let selectedYear = nowMonth.getFullYear();
          if (nowColumn.innerText < 10) {
            selectedDate = "0" + nowColumn.innerText;
          } else if (nowColumn.innerText >= 10) {
            selectedDate = nowColumn.innerText;
          }
          if (nowMonth.getMonth() + 1 < 10) {
            selectedMonth = "0" + (nowMonth.getMonth() + 1);
          } else if (nowMonth.getMonth() + 1 >= 10) {
            selectedMonth = nowMonth.getMonth() + 1;
          }
          let selectedDay =
            selectedYear + "-" + selectedMonth + "-" + selectedDate;
          for (let k = 0; k < response.data.length; k++) {
            let selectedDayCounts = 0;
            if (response.data[k].date == selectedDay) {
              selectedDayCounts++;
            }
          }

          let i = 0;
          let done = false;

          while (i < response.data.length && !done) {
            if (response.data[i].date == selectedDay) {
              let newLog = $(
                "<div class='log-review-buttons'>" +
                  "<div class='studyLog'>" +
                  response.data[i].topic +
                  "</div>" +
                  "<div class='reviewBtn'>복습하기</div>" +
                  "</div>"
              );
              $(".studyLog").click(function () {
                $("#modal-data").empty();
                for (
                  let j = 0;
                  j < response.data[i - 1].studyLogDtos.length;
                  j++
                ) {
                  showModal(
                    "<div class='modal-content-log'>" +
                      "<div>" +
                      "이렇게 말하셨어요: " +
                      response.data[i - 1].studyLogDtos[j].userInput +
                      "</div>" +
                      "<div>" +
                      "이렇게 말하는게 더 좋아요: " +
                      response.data[i - 1].studyLogDtos[j].fixedAnswer +
                      "</div>" +
                      "틀린 이유: " +
                      "<div>" +
                      response.data[i - 1].studyLogDtos[j].reason +
                      "</div>" +
                      "</div>"
                  );
                }
                // once the inner loop completes, set done to true
                done = true;
                return;
              });
              i++;

              $(".reviewBtn").click(function () {
                $("#modal-data").empty();
                showModal(null, true);

                // Assuming response.data is an array of study logs, each with 'userInput' and 'fixedAnswer' properties
                let quizData = response.data[i].studyLogDtos;
                let quizIndex = 0;

                function loadQuizItem(index) {
                  $("#question").text("Question: " + quizData[index].userInput);
                  $("#answer").text("Answer: " + quizData[index].fixedAnswer);
                }

                loadQuizItem(quizIndex);

                $("#prev").click(function () {
                  if (quizIndex > 0) {
                    quizIndex--;
                    loadQuizItem(quizIndex);
                  }
                });

                $("#next").click(function () {
                  if (quizIndex < quizData.length - 1) {
                    quizIndex++;
                    loadQuizItem(quizIndex);
                  }
                });
              });

              $("#history-wrap").append(newLog);
            }
          }
        },
      });
      function showModal(data, review = false) {
        if (review) {
          let quizContent = $("<div class ='modal-content-quiz'></div>");
          let question = $("<div id='question'></div>");
          let answer = $("<div id='answer'></div>");
          let userAnswer = $("<input class='underline' type='text'></input>");
          let prevButton = $("<button id='prev'>Previous</button>");
          let nextButton = $("<button id='next'>Next</button>");

          quizContent.append(
            question,
            answer,
            userAnswer,
            prevButton,
            nextButton
          );
          $("#modal-data").append(quizContent);
        } else {
          $("#modal-data").append(data);
        }
        $("#myModal").show();

        // <span> (x) 누르면 꺼짐
        $(".close").click(function () {
          $("#myModal").hide();
        });

        // 모달 창 바깥 누르면 꺼짐
        $(window).click(function (event) {
          if (event.target == $("#myModal").get(0)) {
            $("#myModal").hide();
          }
        });
      }

      // function showModal(data) {
      //   $("#modal-data").append(data); // 모달 창 채우기
      //   $("#myModal").show();

      // }
    }; // 클릭되었을 때

    if (
      nowDay.getFullYear() == today.getFullYear() &&
      nowDay.getMonth() == today.getMonth() &&
      nowDay.getDate() == today.getDate()
    ) {
      // 오늘인 경우
      nowColumn.className = "today";
    } else {
      nowColumn.className = "days";
    }
  }
}

// 날짜 선택
function choiceDate(nowColumn) {
  if (document.getElementsByClassName("choiceDay")[0]) {
    // 기존에 선택한 날짜가 있으면
    document
      .getElementsByClassName("choiceDay")[0]
      .classList.remove("choiceDay"); // 해당 날짜의 "choiceDay" class 제거
  }
  nowColumn.classList.add("choiceDay"); // 선택된 날짜에 "choiceDay" class 추가
}

// 이전달 버튼 클릭
function prevCalendar() {
  nowMonth = new Date(
    nowMonth.getFullYear(),
    nowMonth.getMonth() - 1,
    nowMonth.getDate()
  ); // 현재 달을 1 감소
  buildCalendar(); // 달력 다시 생성
  showMain(
    nowMonth.getFullYear(),
    nowMonth.getMonth() + 1,
    nowColumn.innerText
  );
}

// 다음달 버튼 클릭
function nextCalendar() {
  nowMonth = new Date(
    nowMonth.getFullYear(),
    nowMonth.getMonth() + 1,
    nowMonth.getDate()
  ); // 현재 달을 1 증가
  buildCalendar(); // 달력 다시 생성
  showMain(
    nowMonth.getFullYear(),
    nowMonth.getMonth() + 1,
    nowColumn.innerText
  );
}

function leftPad(value) {
  if (value < 10) {
    value = "0" + value;
    return value;
  }
  return value;
}

// 학습 기록
function showMain(givenYear, givenMonth, givenDate) {
  document.getElementById("mainYear").innerText = givenYear;
  document.getElementById("mainMonth").innerText = givenMonth;
  document.getElementById("mainDay").innerText = givenDate;
}
