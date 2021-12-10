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
    var svg = d3.select("#bubbles")
    var defs = svg.append("defs");
    var pattern = defs.selectAll("circle")
        .data(Object.keys(colorset))
        .enter().append("pattern")
        .style("stroke", "gray")
        .attr("x", "0%")
        .attr("y", "0%")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 512 512")
        .attr("id", d => "circle" + d.toLowerCase().replace(/ /g,'').replace("&", ""))
        .append("svg:image")
        .attr("x", "0%")
        .attr("y", "0%")
        .attr("width", 512)
        .attr("height", 512)
        .attr("xlink:href", d => "img/" + d.toLowerCase().replace(/ /g,'').replace("&", "") + ".png")
        
    for (key in Object.keys(colorset)) {
        let genre = Object.keys(colorset)[key];
        genre = genre.toLowerCase().replace(/ /g,'').replace("&", "")
        var circles = svg
            .append("circle")
            .attr("r", 0)
            .style("fill", "green")
    }
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
    var circles = d3.select("#bubbles").selectAll("circle")
        .data(nodes)
        .style("fill", function(d) {
            let name  = d.data.name;
            name = name.toLowerCase().replace(/ /g,'').replace("&", "");
            return "url(#circle" + name + ")";
        })
        .attr("r", d => getRadius(d, sumPopularity, maxHeight))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration("100")
                .attr("r", d => getRadius(d, sumPopularity, maxHeight) + 25)
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
        // Filter out unused genres for easier packing
        if (data[key] > 0) {
            let entry = {
                "name" : key,
                "value" : data[key],
            }
            result.push(entry)
        };
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
