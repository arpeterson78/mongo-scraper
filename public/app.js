function makeCard(data) {


    for (var i = 0; i < data.length; i++) {

        var card = $("<div>");
        card.attr("class", "card");

        var image = $("<img>");
        image.attr("src", data[i].image);
        image.attr("class", "player-image");
        card.append(image);

        var title = $("<h3>");
        title.attr("class", "card-header");
        title.text(data[i].title);
        card.append(title);

        var report = $("<p>");
        report.attr("class", "player-report");
        report.text(data[i].report);
        card.append(report);

        var summary = $("<p>");
        summary.attr("class", "player-summary");
        summary.text(data[i].summary);
        card.append(summary);

        var date = $("<p>");
        date.attr("class", "player-date");
        date.text(data[i].date);
        card.append(date);


        var save = $("<button>");
        save.attr("class", "save-button");
        save.attr("data-id", data[i]._id);
        save.text("Save Article");
        card.append(save);

        $(".results").append(card)
    }

}

function initializePage() {
    $(".results").empty();
    $.getJSON("/all", function (data) {
        makeCard(data);
    })
}

$("#scraping").on("click", function () {
    $(".results").empty();
    $.get("/scrape", function () {
        console.log("Scraping...");

        setTimeout(function () {
            $.getJSON("/all", function (data) {
                makeCard(data);
                alert("" + data.length + "articles added!")
            });
        }, 2000);

    })
})

$("#saved").on("click", function () {
    $(".results").empty();

    setTimeout(function () {
        $.getJSON("/saved", function (data) {
            makeCard(data);
            for (var i = 0; i < data.length; i++) {
                var removeArticle = $("<button>");
                removeArticle.attr("class", "remove-button");
                removeArticle.attr("data-id", data[i]._id);
                removeArticle.text("Remove Article");
                

            }
            $(".card").append(removeArticle);
            alert("You have " + data.length + " articles saved!");
        });
    }, 500);

})

$(document).on("click", ".save-button", function () {
    $.post("/save", { id: $(this).attr("data-id") });

});

$(document).on("click", ".remove-button", function () {
   // $.post("/remove", { id: $(this).attr("data-id") });
//    $(this).parent(".card").empty();
//    alert("Article Removed");
    var that = this;
    var data = {id : $(that).attr('data-id')};

    $.ajax({
        url: "/remove",
        method: "POST",
        data: data
    }, function(response){
        console.log('line 106', response)
        $(that).parent(".card").empty();
        alert("Article Removed");
    });


    });

    initializePage();








