$(document).ready(function () {
  $("#mainlogo").click(function () {
    var url = "/login.html";
    window.location.href = url;
  });
});

$(document).ready(function () {
  $("#log-in").click(function () {
    var url = "/login.html";
    window.location.href = url;
  });
});

$.check = function () {
  if ($("#id").val() == "") {
    alert("이메일을 입력해주세요");
    $("#id").focus();
    return false;
  }

  if ($("#nickname").val() == "") {
    alert("닉네임을 입력해주세요");
    $("#id").focus();
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
};

$("#signup-btn").click($.check);
