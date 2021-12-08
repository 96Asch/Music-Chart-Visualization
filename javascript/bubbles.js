// Set overall margins
const colorset = {
    'African': "#69b3a2",
    'Central Asian': "#554fa9",
    'Southeast Asian': "#e75327",
    'Avant-garde': "#c1cd53",
    'Blues': "#554fa9",
    'Caribbean and Caribbean-influenced': "#ce614d",
    'Country': "#998b6b",
    'Easy listening': "#66e5b3",
    'Electronic': "#e8ef16",
    'Folk': "#fdd222",
    'Hip hop': "#f49942",
    'Jazz': "#f1d252",
    'Latin': "#045c0c",
    'Pop': "#1e9988",
    'R&B and Soul': "#37c7d7",
    'Rock': "#9b959a"
}



function init_bubbles() {
    // NOTE this function is called before the data is there.
    // Thus don't use the 'data' variable in this function!
    // Initialize all circles
    var node = d3.select("#bubbles").append("g")
        .selectAll("circle").data(Object.keys(colorset))
        .enter().append("circle")
        .style("stroke", "gray")
        .style("fill", (d, i) => colorset[d])
        .attr("r", (genre) => 0)
        .attr("cx", (d, i) => 50 + (i * 30))
        .attr("cy", (d, i) => 50 + Math.random() * 100);
}

function draw_bubbles(week_index) {
    if (week_index < 0 || week_index > data["weeks"].length) return;
    // Resize the plot if needed
    const bubbleDiv = document.getElementById("bubbles_div");
    const totalWidth = Math.floor(bubbleDiv.clientWidth * 0.9 / 50) * 50;
    if (totalWidth != d3.select("#bubbles").attr("width")) {
        const totalHeight = bubbleDiv.clientHeight * 0.95;
        d3.select("#bubbles")
            .attr("width", totalWidth)
            .attr("height", totalHeight);
    }

    // Draw circles
    const about = data["weeks"][week_index];
    d3.select("#bubbles").selectAll("circle")
        .attr("r", (d, i) => about["popularity"][d.toLowerCase()])
        .style("fill-opacity", function(d, i) {
            return about["popularity"][d.toLowerCase()] * 0.05
        })
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", about["popularity"][d.toLowerCase()] + 5)
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", about["popularity"][d.toLowerCase()])
        })
        .on("click", (event, genre) => {
            console.log("Clicked " + genre);
            // const genres = data["genres"];
            // for (var j = 0; j < genres.length; j++) {
            //     if (genres[j]["genre"] == genre.toLowerCase()) {
            //         console.log(genres[j]["subgenre"])
            //     }
            // }
        });
}


init_bubbles();
promise_genre_popularity().then(function(newdata) {
    add_data("genres", newdata["genres"]);
    add_data("weeks", newdata["weeks"]);
    add_slider_callback(draw_bubbles);
}).catch(function(err) {
    console.log(err);
})
