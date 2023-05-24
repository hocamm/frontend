$(document).ready(function () {
  $("#mainlogo").click(function () {
    var url = "./index.html";
    window.location.href = url;
  });
});

$(document).ready(function () {
  $("#sign-up").click(function () {
    var url = "./signup.html";
    window.location.href = url;
  });
});

$.check = function () {
  if ($("#id").val() == "") {
    alert("이메일을 입력해주세요");
    $("#id").focus();
    return false;
  }

  if ($("#pw").val() == "") {
    alert("비밀번호를 입력해주세요.");
    $("#pw").focus();
    return false;
  }
};

$("#login-btn").click($.check);

$(function () {
  $("#login-btn").on("click", function () {
    var userid = $("#id").val();
    var userpw = $("#pw").val();
    var data = {
      email: userid,
      password: userpw,
    };
    $.ajax({
      url: "http://43.200.123.232:8080/user/login",
      method: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      xhrFields: {
        withCredentials: true,
      },
      data: JSON.stringify(data),
      success: function (data, textStatus, jqXHR) {
        console.log("로그인 성공");
        alert("로그인 되었습니다");
      },
      error: function (error) {
        console.error("로그인 실패: " + error);
        alert("아이디나 비밀번호가 다릅니다");
      },
    });
  });
});
