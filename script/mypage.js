$(window).on("load", function () {
  buildCalendar();
  showMain(today.getFullYear(), today.getMonth() + 1, today.getDate());
  fetchStudyLogsForDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

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

let nowMonth = new Date();
let today = new Date();
today.setHours(0, 0, 0, 0);

function showModal(data, review = false) {
  if (review) {
    let quizInfo = $("<div class='quizInfo'><div id='info'></div></div>");
    let quizContent = $("<div class ='modal-content-quiz'></div>");
    let question = $("<div id='question'></div>");
    let answer = $("<div id='answer'></div>");
    let userAnswer = $(
      "<input id='userAnswer' autocomplete='off' type='text'></input>"
    );
    let quizButtons = $("<div class='modal-buttons'></div>");
    let prevButton = $(
      "<button id='prevBtn'><i class='fa-solid fa-angles-left'></i>이전 문제</button>"
    );
    let nextButton = $(
      "<button id='nextBtn'>다음 문제<i class='fa-solid fa-angles-right'></i></button>"
    );
    let submitButton = $("<button id='submitBtn'>정답 제출</button>");

    quizContent.append(question, answer, userAnswer);
    $("#modal-data").append(quizInfo);
    $("#modal-data").append(quizContent);
    quizButtons.append(prevButton, submitButton, nextButton);
    $("#modal-data").append(quizButtons);
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

function fetchStudyLogsForDate(year, month, date) {
  let urldate =
    "https://www.hocam.kr/" + "study?year=" + year + "&" + "month=" + month;

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
      let selectedYear = year;
      if (date < 10) {
        selectedDate = "0" + date;
      } else if (date >= 10) {
        selectedDate = date;
      }
      if (month < 10) {
        selectedMonth = "0" + month;
      } else if (month >= 10) {
        selectedMonth = month;
      }
      let selectedDay = selectedYear + "-" + selectedMonth + "-" + selectedDate;

      for (let i = 0; i < response.data.length; i++) {
        // 선택한 날짜만 log에 넣음
        if (response.data[i].date == selectedDay) {
          let newLog = $(
            "<div class='log-review-buttons'>" +
              "<div class='studyLog'>" +
              response.data[i].topic +
              "</div>" +
              "<div class='reviewBtn'>복습하기</div>" +
              "</div>"
          );

          newLog.find(".studyLog").click(
            (function (i) {
              return function () {
                console.log(response.data[i].studyLogDtos);
                $("#modal-data").empty();
                for (let j = 0; j < response.data[i].studyLogDtos.length; j++) {
                  if (response.data[i].studyLogDtos[j].userInput !== null) {
                    showModal(
                      "<div class='modal-content-log'>" +
                        "<p id ='yousaid'>" +
                        "이렇게 말하셨어요: " +
                        response.data[i].studyLogDtos[j].userInput +
                        "</p>" +
                        "<p id ='youdbetter'>" +
                        "이렇게 말하는게 더 좋아요: " +
                        response.data[i].studyLogDtos[j].fixedAnswer +
                        "</p>" +
                        "💡 틀린 이유: " +
                        "<p>" +
                        response.data[i].studyLogDtos[j].reason +
                        "</p>" +
                        "</div>"
                    );
                  } else if (
                    response.data[i].studyLogDtos.length == 1 &&
                    response.data[i].studyLogDtos[0].userInput == null
                  ) {
                    alert("저장된 대화 내용이 없습니다.");
                  } else if (response.data[i].studyLogDtos.length == 0) {
                    alert("저장된 대화 내용이 없습니다.");
                  }
                }
              };
            })(i)
          );

          newLog.find(".reviewBtn").click(
            (function (i) {
              return function () {
                $("#modal-data").empty();

                let quizData = response.data[i].studyLogDtos;
                console.log(response.data[i].studyLogDtos);
                let quizIndex = 0;

                if (quizData.length == 1 && quizData[0].userInput == null) {
                  console.log(quizData[0].userInput);
                  alert("복습 데이터가 없습니다.");
                } else if (quizData.length == 0) {
                  alert("복습 데이터가 없습니다.");
                } else {
                  showModal(null, true);
                }

                function loadQuizItem(index) {
                  if (quizData[index].userInput !== null) {
                    $("#question").html(
                      "<div id='question'>" +
                        quizData[index].userInput +
                        "</div>"
                    );

                    $("#info").html(
                      "<p id = mention>" +
                        "💡 전에 틀렸었던 문장입니다. 올바른 문장으로 고쳐보세요." +
                        "</p>" +
                        "<p id='quizNumber'>[ " +
                        (quizIndex + 1) +
                        " / " +
                        quizData.length +
                        " ]</p>"
                    );

                    $("#answer").hide();
                    $("#userAnswer").val("");
                  }
                }

                if (quizData[0].userInput !== null) {
                  loadQuizItem(0);
                } else {
                  loadQuizItem(1);
                }

                $("#userAnswer").on("keyup", function (key) {
                  if (key.keyCode == 13) {
                    if (this.value == quizData[quizIndex].fixedAnswer) {
                      $("#answer")
                        .html(
                          "<div id ='rightAnswer'>" +
                            " ✔️ 정답입니다!: " +
                            quizData[quizIndex].fixedAnswer +
                            "</div>"
                        )
                        .show();
                    } else if ($("#userAnswer").val().length == 0) {
                      $("#answer")
                        .html(
                          "<div id ='wrongAnswer'>" +
                            "내용을 입력해 주세요!" +
                            "</div>"
                        )
                        .show();
                    } else if (this.value != quizData[quizIndex].fixedAnswer) {
                      $("#answer")
                        .html(
                          "<div id ='wrongAnswer'>" +
                            "✖️ 틀렸습니다. 다시 시도하세요! " +
                            "</div>"
                        )
                        .show();
                    }
                  }
                });

                $("#submitBtn").on("click", function () {
                  let userInputValue = $("#userAnswer").val();
                  if (userInputValue == quizData[quizIndex].fixedAnswer) {
                    $("#answer")
                      .html(
                        "<div id ='rightAnswer'>" +
                          " ✔️ 정답입니다!: " +
                          quizData[quizIndex].fixedAnswer +
                          "</div>"
                      )
                      .show();
                  } else if (userInputValue.length == 0) {
                    $("#answer")
                      .html(
                        "<div id ='wrongAnswer'>" +
                          "내용을 입력해 주세요!" +
                          "</div>"
                      )
                      .show();
                  } else if (
                    userInputValue != quizData[quizIndex].fixedAnswer
                  ) {
                    $("#answer")
                      .html(
                        "<div id ='wrongAnswer'>" +
                          "✖️ 틀렸습니다. 다시 시도하세요! " +
                          "</div>"
                      )
                      .show();
                  }
                });

                $("#prevBtn").on("click", function () {
                  if (quizIndex > 0) {
                    quizIndex--;
                    loadQuizItem(quizIndex);
                  }
                  return false;
                });

                $("#nextBtn").on("click", function () {
                  if (quizIndex < quizData.length - 1) {
                    quizIndex++;
                    loadQuizItem(quizIndex);
                  }
                  return false;
                });
              };
            })(i)
          );

          $("#history-wrap").append(newLog);
        }
      }
    },
  });
}

function buildCalendar() {
  let firstDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1); // 이번달 1일
  let lastDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, 0); // 이번달 마지막 날

  let urlDate =
    "https://www.hocam.kr/study?year=" +
    nowMonth.getFullYear() +
    "&month=" +
    (nowMonth.getMonth() + 1);

  $.ajax({
    url: urlDate,
    type: "GET",
    dataType: "json",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      let studyData = response.data;

      let tbody_Calendar = $(".Calendar > tbody");
      $("#calYear").text(nowMonth.getFullYear()); // 연도 숫자 갱신
      $("#calMonth").text(leftPad(nowMonth.getMonth() + 1)); // 월 숫자 갱신

      tbody_Calendar.empty();

      let nowRow = $("<tr></tr>").appendTo(tbody_Calendar); // 첫번째 행 추가

      for (let j = 0; j < firstDate.getDay(); j++) {
        // 이번달 1일의 요일만큼
        let nowColumn = $("<td></td>").appendTo(nowRow); // 열 추가
      }

      for (
        let nowDay = firstDate;
        nowDay <= lastDate;
        nowDay.setDate(nowDay.getDate() + 1)
      ) {
        let nowColumn = $("<td></td>").appendTo(nowRow);

        // 셀 내부에 텍스트와 체크 표시를 감싸는 <div> 요소 생성
        let cellContent = $("<div class='cell-content'></div>");

        // 날짜를 텍스트로 추가
        let dateText = $("<span></span>")
          .text(nowDay.getDate())
          .appendTo(cellContent);

        // 학습 데이터가 있는지 확인하고, 있을 경우 체크 표시를 추가
        for (let i = 0; i < studyData.length; i++) {
          if (studyData[i].date === getFormattedDate(nowDay)) {
            let checkMark = $("<i></i>")
              .addClass("fa-solid fa-circle-check")
              .appendTo(cellContent);
            break;
          }
        }

        nowColumn.append(cellContent);

        if (nowDay.getDay() == 0) {
          // 일요일인 경우 글자색 빨강으로
          nowColumn.css("color", "#DC143C");
        }

        if (nowDay.getDay() == 6) {
          // 토요일인 경우 글자색 파랑으로
          nowColumn.css("color", "#0000CD");
          nowRow = $("<tr></tr>").appendTo(tbody_Calendar); // 새로운 행 추가
        }

        if (
          nowDay.getFullYear() == today.getFullYear() &&
          nowDay.getMonth() == today.getMonth() &&
          nowDay.getDate() == today.getDate()
        ) {
          // 오늘인 경우
          nowColumn.addClass("today");
        }

        let selectedDay = nowDay.getDate(); // 선택한 날짜
        nowColumn.on("click", function () {
          choiceDate(this);
          showMain(
            nowMonth.getFullYear(),
            nowMonth.getMonth() + 1,
            selectedDay
          );
          fetchStudyLogsForDate(
            nowMonth.getFullYear(),
            nowMonth.getMonth() + 1,
            selectedDay
          );
        });
      }
    },
  });
}

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = leftPad(date.getMonth() + 1);
  let day = leftPad(date.getDate());
  return `${year}-${month}-${day}`;
}

// 날짜 선택
function choiceDate(nowColumn) {
  if ($(nowColumn).hasClass("choiceDay")) {
    // 이미 선택된 날짜인 경우
    $(nowColumn).removeClass("choiceDay"); // "choiceDay" class 제거
  } else {
    if ($(".choiceDay").length > 0) {
      // 다른 날짜가 선택되어 있으면
      $(".choiceDay").removeClass("choiceDay"); // 해당 날짜의 "choiceDay" class 제거
    }
    $(nowColumn).addClass("choiceDay"); // 선택된 날짜에 "choiceDay" class 추가
  }
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
  $("#mainYear").text(givenYear);
  $("#mainMonth").text(givenMonth);
  $("#mainDay").text(givenDate);
}
