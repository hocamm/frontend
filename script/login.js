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

$.ajax({
  url: "/api/user",
  type: "GET",
  headers: {
    "Authorization": "Bearer " + getAccessToken()
  },
  success: function(data) {
  },
  error: function() {
  }
});

$(function () {
  $("#login-Btn").click(function () {
    var userid = $("#id").val();
    var userpw = $("#pw").val();
    var data = {
      email: userid,
      password: userpw,
    };
    $.ajax({
      url: "api/auth/login",
      method: "POST",
      data: data,
      success: function (data) {
        saveAccessToken(data.data);
        console.log("로그인 성공");
        alert("로그인 되었습니다");
        window.location.href = "./home.html";
      },
      error: function (jqXHR) {
        console.error("로그인 실패: " + jqXHR);
        alert("아이디나 비밀번호가 다릅니다")
      },
    });
  });
});
