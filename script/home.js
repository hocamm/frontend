$.ajax({
    url: "/api/user",
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