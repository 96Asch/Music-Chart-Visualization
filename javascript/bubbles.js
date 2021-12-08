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
    // Create bubble SVG
    var bubble = d3.select("#bubbles")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 300")
        .attr("overflow", "hidden");
    // Initialize all circles
    var node = bubble.append("g")
        .selectAll("circle")
        .data(Object.keys(colorset))
        .enter().append("circle")
        .style("stroke", "gray")
        .style("fill", (d, i) => colorset[d])
        .attr("r", (genre) => 0)
        .attr("cx", (d, i) => 50 + (i * 30))
        .attr("cy", (d, i) => 50 + Math.random() * 100);
}

function draw_bubbles(week_index) {
    if (week_index < 0 || week_index > data["weeks"].length) return;
    const about = data["weeks"][week_index];
    const topsong = about.songs[0];
    document.getElementById("toptext").innerHTML = (about.week + "  [Top song: "
        + topsong.features.title + " - " + topsong.features.artist + "]");
    // Packing code
    var pack = d3.pack()
        .size([700, 500 - 50])
        .padding(10);    
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
    var nodes = pack(root).descendants()
    var node = d3.select("#bubbles").selectAll("circle")
        .data(nodes)
        // .attr("r", d => d.value
        .style("fill-opacity", d => d.data.value * 0.05)
        .style("fill", d => colorset[d.data.name.charAt(0).toUpperCase() + d.data.name.slice(1)])
        .attr("r", d => getRadius(d, sumPopularity))
        .attr("cx", (d, i) => 400 * d.x / sumPopularity - 300)
        .attr("cy", (d, i) => 400 * d.y / sumPopularity)
        // .attr("r", (d, i) => about["popularity"][d.toLowerCase()])
        // .style("fill-opacity", function(d, i) {
        //     return about["popularity"][d.toLowerCase()] * 0.05
        // })
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", d => getRadius(d, sumPopularity) + 5)
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", d => getRadius(d, sumPopularity))
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


function getRadius(d, sum) {
    let entry = d.data
    let radius = entry == null ? 0 : entry.value
    radius = radius > 0 ? 400 * (radius / sum) : 0
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

create_svgs();
init_bubbles();
promise_genre_popularity().then(function(newdata) {
    add_data("genres", newdata["genres"]);
    add_data("weeks", newdata["weeks"]);
    add_slider_callback(draw_bubbles);
}).catch(function(err) {
    console.log(err);
})
