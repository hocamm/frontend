$.ajax({
    url: "http://13.209.187.148:8080/api/user",
    type: "GET",
    headers: {
      "Authorization": "Bearer " + getAccessToken()
    },
    success: function(data) {
     
    },
    error: function() {
        console.log()
    }
  });