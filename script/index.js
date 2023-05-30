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

$(document).ready(function () {
  $("#login-btn").keypress(function (event) {
    if (event.which == 13) {
      event.preventDefault();
      $("#login-btn").click();
    }
  });
});

$(function () {
  $("#login-btn").on("click", function () {
    var userid = $("#id").val();
    var userpw = $("#pw").val();
    var data = {
      email: userid,
      password: userpw,
    };
    $.ajax({
      url: "https://www.hocam.kr/user/login",
      method: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      xhrFields: {
        withCredentials: true,
      },
      data: JSON.stringify(data),
      success: function (data, textStatus, jqXHR) {
        console.log("로그인 성공");
        console.log("Cookies: " + document.cookie); // log cookies
        alert("로그인 되었습니다");
        window.location.href = "./home.html";
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("로그인 실패: " + errorThrown);
        alert("아이디나 비밀번호가 다릅니다");
      },
      complete: function (jqXHR, textStatus) {
        console.log("Response Headers: ", jqXHR.getAllResponseHeaders());
        console.log("Response Body: ", jqXHR.responseText);
      },
    });
  });
});
