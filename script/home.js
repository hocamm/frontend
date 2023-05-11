// $.ajax({
//     url: "http://13.209.187.148:8080/api/user",
//     type: "GET",
//     headers: {
//       "Authorization": "Bearer " + getAccessToken()
//     },
//     success: function(data) {
     
//     },
//     error: function() {
//         console.log()
//     }
//   });

// 채팅방 생성 api
$(document).ready(function () {
  $("#log-in").click(function () {
    $.ajax({
      url: "http://43.200.123.232:8080/chat",
      type: "POST",
      dataType : "json",
      data: JSON.stringify(data),
      contentType : "application/json; charset=utf-8",
      success: function(response) {
          alert("회원가입이 완료되었습니다.");
          window.location.href = "./home.html"
          console.log(response)
        },
      error: function(response) {
        alert("회원가입에 실패했습니다.");
        console.log(response)
        window.location.href = "./home.html"
      },
    });
  });
   
});

  