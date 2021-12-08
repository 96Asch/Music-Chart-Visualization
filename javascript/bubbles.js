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
    'Electronic': "#a8ff16",
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
        .attr("r", (genre) => 0);
}

function draw_bubbles(week_index) {
    if (week_index < 0 || week_index > data["weeks"].length) return;
    // Resize the plot if needed
    const bubbleDiv = document.getElementById("bubbles_div");
    const totalWidth = Math.floor(bubbleDiv.clientWidth * 0.9 / 50) * 50;
    const totalHeight = bubbleDiv.clientHeight * 0.95;
    if (totalWidth != d3.select("#bubbles").attr("width")) {
        d3.select("#bubbles")
            .attr("width", totalWidth)
            .attr("height", totalHeight);
    }
    const maxHeight = totalHeight / 2;

    // Draw circles
    const about = data["weeks"][week_index];
    const topsong = about.songs[0];
    document.getElementById("toptext").innerHTML = (about.week + "  [Top song: "
        + topsong.features.title + " - " + topsong.features.artist + "]");
    // Packing code
    var pack = d3.pack().size([totalWidth, totalHeight])
    var weekData = transformDataToGroup(about.popularity);
    var values = weekData.map(a => a.value);
    var sumPopularity = values.reduce((a,b) => a + b);

    var root = {
        "name" : "root",
        "children" : weekData
    }
    root = d3.hierarchy(root)
        .sum(d => d.value)
        .sort((a,b) => b.value - a.value)
    var nodes = pack(root)
    var node = d3.select("#bubbles").selectAll("circle")
        .data(nodes)
        .style("fill-opacity", d => d.data.value * 0.05)
        .attr("r", d => getRadius(d, sumPopularity, maxHeight))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", d => getRadius(d, sumPopularity, maxHeight) + 5)
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", d => getRadius(d, sumPopularity, maxHeight))
        })
        .on("click", (event, genre) => {
            console.log(genre.data.name);
            // const genres = data["genres"];
            // for (var j = 0; j < genres.length; j++) {
            //     if (genres[j]["genre"] == genre.toLowerCase()) {
            //         console.log(genres[j]["subgenre"])
            //     }
            // }
        });

}


function getRadius(d, sum, maxHeight) {
    let entry = d.data
    let radius = entry == null ? 0 : entry.value
    radius = radius > 0 ? maxHeight * (radius / sum) : 0
    return radius;
}

function transformDataToGroup(data) {
    let result = [];
    for (var key in data) {
        let entry = {
            "name" : key,
            "value" : data[key],
        }
        result.push(entry);
    }
    return result;
}

init_bubbles();
promise_genre_popularity().then(function(newdata) {
    add_data("genres", newdata["genres"]);
    add_data("weeks", newdata["weeks"]);
    add_slider_callback(draw_bubbles);
}).catch(function(err) {
    console.log(err);
})
