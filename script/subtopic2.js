$(document).ready(function () {
  $("#mainlogo").click(function () {
    var url = "./home.html";
    window.location.href = url;
  });
  $(".topic-first, .topic-mid, .topic-last").on("click", function (event) {
    event.preventDefault();
    const topicId = $(this).find("p").attr("id");
    sessionStorage.setItem("selectedTopic", topicId);
    window.location.href = $(this).attr("href");
  });
});
