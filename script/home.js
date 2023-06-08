$(document).ready(function () {
  $("#mainlogo").click(function () {
    window.location.href = "home.html";
  });
  $("#my-page-btn").click(function () {
    window.location.href = "mypage.html";
  });
  $("#FreeTalkingBtn").on("click", sessionStorage.clear());

  $.ajax({
    url: "https://www.hocam.kr/user/info",
    method: "GET",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      if (response.status === 200) {
        console.log(response.data);
        $("#user-nickname").text(
          response.data["nickname"] + "님 오랜만이에요!"
        );
        $("#user-email").text("email: " + response.data["email"]);
      }
    },
    error: function (error) {
      console.error("데이터 수신 실패: " + error);
    },
  });
});
