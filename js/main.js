$(function() {
    var freddyRating,
        baseFig = document.getElementById('baseCard'),
        baseRot = 0,
        msgFig = document.getElementById('msgCard'),
        msgRot = 180,
        resultFig = document.getElementById('resultCard'),
        resultRot = 180,
        loadMsgs = ['Hmmm...', 'Let me check...', "Let's see...", 'Interesting choice...', 'Oh man...',
            'It might be...', "Tough one...", 'Ooo good one...', 'Well...', 'Maybe...'];

    //clear the input
    $('#movie').val('');

    //Get and store Freddy's rating
    $.ajax({
        url: "http://api.rottentomatoes.com/api/public/v1.0/movies/13997.json?apikey=zf4yhdsrtqyyhtcfdv7t9azm",
        dataType: "jsonp",
        success: function(data) {
            freddyRating = (data.ratings.critics_score + data.ratings.audience_score) / 2;
            $("#fRating").text(freddyRating + "%");
        }
    });
    
    //Setup the autocomplete widget
    $("#movie").autocomplete({
        html: true,
        minLength: 3,
        source: function(request, response) {
            $.ajax({
                url: "http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=zf4yhdsrtqyyhtcfdv7t9azm",
                dataType: "jsonp",
                data: {
                    q: request.term,
                    page_limit: 8
                },
                success: function(data) {
                    var results = data.movies,
                    suggestions = [],
                    curMovie,
                    curCast,
                    htmlPartial,
                    i, j;

                    for (i = 0; i < results.length; i++) {
                        curMovie = results[i];
                        curCast = [];

                        for (j = 0; j < curMovie.abridged_cast.length && j < 3; j++) {
                            curCast.push(curMovie.abridged_cast[j].name);
                        }

                        htmlPartial = "<img src='" + curMovie.posters.thumbnail + "' alt='Cover Image'></img>" +
                            "<div class='meta'>" +
                            "<p class='title'>" + curMovie.title + " <span class='date'>(" + curMovie.year + ")</span></p>" +
                            "<p class='detail'>" + curCast.join(', ') + "</p>" +
                            "</div>";

                        suggestions.push({
                            label: htmlPartial,
                            value: curMovie.title,
                            rating: (curMovie.ratings.critics_score + curMovie.ratings.audience_score) / 2,
                            url: curMovie.links.alternate
                        });
                    }
                    response(suggestions);
                }
            });
        },
        select: function(event, ui) {
            var newAdj,
                newClass;

            $("#resultCard").removeClass("better").removeClass("worse").removeClass("equal").removeClass("identical");

            if (ui.item.rating > freddyRating) {
                newAdj = "better";
                newClass = "better";
            }
            else if (ui.item.rating < freddyRating) {
                newAdj = "worse";
                newClass = "worse";
            }
            else {
                if (ui.item.value == "Freddy Got Fingered") {
                    newAdj = "the same movie";
                    newClass = "identical";
                }
                else {
                    newAdj = "equal";
                    newClass = "equal";
                }
            }

            $("#msg").text(loadMsgs[Math.floor(Math.random()*loadMsgs.length)]);
            $("#resultCard").addClass(newClass);
            $("#adj").text(newAdj);
            $("#ratings>a").attr("href", ui.item.url);
            $("#uRating").text(ui.item.rating + "%");

            flipToResult();
        },
        open: function() {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function() {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        },
    });
    
    //flip back to the front if they start typing again
    $("#movie").keydown(function(event) {
        flipToFront();
    });

    //flip the flipper to the result card
    var flipToResult = function() {
        //only if the front is showing
        if (baseRot % 360 === 0) {
            baseRot -= 180;
            msgRot -= 180;

            setTransforms(baseFig, baseRot);
            setTransforms(msgFig, msgRot);

            setTimeout(function() {
                msgRot -= 180;
                resultRot -= 180;
                
                setTransforms(msgFig, msgRot);
                setTransforms(resultFig, resultRot);
            }, 700);
        }
    };

    //flip the flipper back to the front
    var flipToFront = function() {
        //only if the result is showing
        if (resultRot % 360 === 0) {
            baseRot += 180;
            //msgRot += 360;
            resultRot += 180;

            setTransforms(baseFig, baseRot);
            setTransforms(resultFig, resultRot);
        }
    };

    //utility for setting up the cross-browser transform rules
    var setTransforms = function(ele, deg) {
        ele.style.transform="rotateX(" + deg + "deg)";
        ele.style.webkitTransform="rotateX(" + deg + "deg)";
        ele.style.OTransform="rotateX(" + deg + "deg)";
        ele.style.MozTransform="rotateX(" + deg + "deg)";
    };
});