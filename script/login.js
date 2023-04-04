$(document).ready(function () {
  $("#mainlogo").click(function () {
    var url = "./login.html";
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

function saveAccessToken(loginData) {
  var accessToken = loginData.data;
  $.session.set("access_token", accessToken);
}

function getAccessToken() {
  return $.session.get("access_token");
}

$(function () {
  $("#login-Btn").click(function () {
    var userid = $("#id").val();
    var userpw = $("#pw").val();

    $.ajax({
      url: "api/auth/login",
      method: "POST",
      data: {
        email: userid,
        password: userpw,
      },
      success: function (jsonData) {
        saveAccessToken(jsonData.data);
        console.log("로그인 성공");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("로그인 실패: " + textStatus);
      },
    });
  });
});
