$(document).ready(function () {
    $("#mainlogo").click(function () {
      var url = "./home.html";
      window.location.href = url;
    });
    $('.topic-first, .topic-mid, .topic-last').on('click', function(event) {
      event.preventDefault(); 
      const topicId = $(this).attr('id');  // Get the ID of the clicked element
      sessionStorage.setItem('selectedTopic', topicId);
      window.location.href = $(this).attr('href');
    });
});
