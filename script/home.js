$(document).ready(function() {
    $.ajax({
        url: 'https://www.hocam.kr/user/info',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            if (response.status === 200) {
                console.log(response.data)
                $(".nickname").text(response.data["nickname"] + "님 오랜만이에요!");
                $(".email").text("email: " + response.data["email"]);
            }
        },
        error: function(error) {
            console.error("데이터 수신 실패: " + error);
        },
    });
});
    