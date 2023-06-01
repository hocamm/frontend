$(document).ready(function () {
    $("#mainlogo").click(function () {
      var url = "./home.html";
      window.location.href = url;
    });
    $('.topic-first, .topic-mid, .topic-last').on('click', function(event) {
      event.preventDefault();
      const topicName = $(this).find('.content').text().trim().replace(/\s+/g, ' ');
      sessionStorage.setItem('selectedTopic', topicName);
      window.location.href = $(this).attr('href');
    });
});
