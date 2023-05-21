$(document).ready(function() {
    function getAccessToken() {
        var name = "access_token=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var accessToken = getAccessToken();

    $.ajax({
        url: 'http://43.200.123.232:8080/api/user', // replace with your actual API url
        method: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        },
        success: function(response) {
            if (response.code === 201) {
                $(".user-name").text(response.data.nickname + "님 오랜만이에요!");
                $(".user-email").text("email: " + response.data.email);
            }
        },
        error: function(error) {
            console.error("데이터 수신 실패 " + error);
        },
    });
});
