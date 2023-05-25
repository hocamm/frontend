window.onload = function () { buildCalendar(); showMain(); }

let nowMonth = new Date();
let today = new Date();
today.setHours(0,0,0,0);

// 달력 생성 : 해당 달에 맞춰 테이블을 만들고, 날짜 채워 놓음
function buildCalendar() {
    
    let firstDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1);       // 이번달 1일
    let lastDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, 0);    // 이번달 마지막 날

    let tbody_Calendar = document.querySelector(".Calendar > tbody");
    document.getElementById("calYear").innerText = nowMonth.getFullYear();              // 연도 숫자 갱신
    document.getElementById("calMonth").innerText = leftPad(nowMonth.getMonth() + 1);   // 월 숫자 갱신

    while (tbody_Calendar.rows.length > 0) {                        // 이전 출력결과가 남아있는 경우 초기화
        tbody_Calendar.deleteRow(tbody_Calendar.rows.length - 1);
    }

    let nowRow = tbody_Calendar.insertRow();        // 첫번째 행 추가

    for (let j = 0; j < firstDate.getDay(); j++) {  // 이번달 1일의 요일만큼
        let nowColumn = nowRow.insertCell();        // 열 추가
    }

    for (let nowDay = firstDate; nowDay <= lastDate; nowDay.setDate(nowDay.getDate() + 1)) {    // day는 날짜를 저장하는 변수, 이번달 마지막날까지 증가시키며 반복

        let nowColumn = nowRow.insertCell();        // 새 열을 추가하고
        nowColumn.innerText = nowDay.getDate();    // 추가한 열에 날짜 입력

        if (nowDay.getDay() == 0) {                 // 일요일인 경우 글자색 빨강으로
            nowColumn.style.color = "#DC143C";
        }
        if (nowDay.getDay() == 6) {                 // 토요일인 경우 글자색 파랑으로    
            nowColumn.style.color = "#0000CD";
            nowRow = tbody_Calendar.insertRow();    // 새로운 행 추가
        }

        nowColumn.onclick = function () { choiceDate(this, nowDay); }   // 클릭되었을 때

        if (nowDay.getFullYear() == today.getFullYear() && nowDay.getMonth() == today.getMonth() && nowDay.getDate() == today.getDate()) { // 오늘인 경우
            nowColumn.className = "today";
        }
        else {
            nowColumn.className = "days";
        }
    }
}

// 날짜 선택
function choiceDate(nowColumn, nowDay) {
    if (document.getElementsByClassName("choiceDay")[0]) {                              // 기존에 선택한 날짜가 있으면
        document.getElementsByClassName("choiceDay")[0].classList.remove("choiceDay");  // 해당 날짜의 "choiceDay" class 제거
    }
    nowColumn.classList.add("choiceDay");           // 선택된 날짜에 "choiceDay" class 추가
    showMain(nowColumn, nowDay);
}

// 이전달 버튼 클릭
function prevCalendar() {
    nowMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth() - 1, nowMonth.getDate());   // 현재 달을 1 감소
    buildCalendar();    // 달력 다시 생성
    showMain();
}

// 다음달 버튼 클릭
function nextCalendar() {
    nowMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, nowMonth.getDate());   // 현재 달을 1 증가
    buildCalendar();    // 달력 다시 생성
    showMain();
}

function leftPad(value) {
    if (value < 10) {
        value = "0" + value;
        return value;
    }
    return value;
}

// 학습 기록
function showMain(nowColumn, nowDay) {
    if(nowColumn === undefined) {
        document.getElementById('mainYear').innerText = today.getFullYear();
        document.getElementById('mainMonth').innerText = today.getMonth() + 1;
        document.getElementById('mainDay').innerText = today.getDate(); 
    }
    document.getElementById('mainYear').innerText = nowDay.getFullYear();
    document.getElementById('mainMonth').innerText = nowDay.getMonth();
    document.getElementById('mainDay').innerText = nowColumn.innerText;      
}

var first = new Date(today.getFullYear(), today.getMonth(), 1);
var leapYear=[31,29,31,30,31,30,31,31,30,31,30,31];
var notLeapYear=[31,28,31,30,31,30,31,31,30,31,30,31];
var pageYear;
if(first.getFullYear() % 4 === 0){
    pageYear = leapYear;
}else{
    pageYear = notLeapYear;
}
var clickedDate1 = document.getElementById(today.getDate());
clickedDate1.classList.add('active');

var tdGroup = [];
function clickStart() {

    for (let i = 1; i <= pageYear[first.getMonth()]; i++) {
        tdGroup[i] = document.getElementById(i);
        tdGroup[i].addEventListener('click', changeToday);
    }
}

function changeToday(e) {

    for(let i = 1; i <= pageYear[first.getMonth()]; i++) {
        if (tdGroup[i].classList.contains('active')){
            tdGroup[i].classList.remove('active');
        }
    }
    clickedDate1 = e.currentTarget;
    clickedDate1.classList.add('active');
    today = new Date(today.getFullYear(), today.getMonth(), clickedDate1.id);
    showMain();
    keyValue = today.getFullYear() + '' + today.getMonth()+ '' + today.getDate();
}

