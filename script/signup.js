// 메인 로고 클릭 시 로그인 화면으로 이동
$(document).ready(function () {
  $("#mainlogo").click(function () {
    var url = "./index.html";
    window.location.href = url;
  });

  $("#log-in").click(function () {
    var url = "./index.html";
    window.location.href = url;
  });
  // 회원가입 버튼 클릭시 유효성 검사
  $.check = function () {
    if ($("#id").val() == "") {
      alert("이메일을 입력해주세요");
      $("#id").focus();
      return false;
    }

    if ($("#nickname").val() == "") {
      alert("닉네임을 입력해주세요");
      $("#nickname").focus();
      return false;
    }

    if ($("#pw").val() == "") {
      alert("비밀번호를 입력해주세요.");
      $("#pw").focus();
      return false;
    }

    if ($("#pw").val() != $("#pw-check").val()) {
      alert("입력하신 비밀번호가 일치하지 않습니다. 올바르게 입력해주세요.");
      $("#pw-check").focus();
      return false;
    }
    return true;
  };
  // 회원가입 버튼 클릭 시 register API 실행
  $("#signup-btn").click(function (event) {
    event.preventDefault();

    if (!$.check()) {
      return;
    }

    var userid = $("#id").val();
    var nickname = $("#nickname").val();
    var userpw = $("#pw").val();

    var data = {
      "email": userid,
      "password": userpw,
      "nickname": nickname,
    };

    $.ajax({
      url: "http://43.200.123.232:8080/user/register",
      type: "POST",
      dataType : "json",
      data: JSON.stringify(data),
      contentType : "application/json; charset=utf-8",
      success: function(response) {
          alert("회원가입이 완료되었습니다.");
          console.log(response)
          window.location.href = "./home.html"
        },
      error: function(response) {
        alert("회원가입에 실패했습니다.");
        console.log(response)
      },
    });
  });
});
