$(document).ready(function() {
    $.ajax({
        url: 'http://43.200.123.232:8080/user/info',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            if (response.code === 200) {
                $(".user-name").text(response.data.nickname + "님 오랜만이에요!");
                $(".user-email").text("email: " + response.data.email);
            }
        },
        error: function(error) {
            console.error("데이터 수신 실패: " + error);
        },
    });
});
    