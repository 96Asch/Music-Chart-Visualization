// Set used for initialization of the colors
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
        .attr("id", d => "circle" + d.toLowerCase().replace(/ /g,'').replace("&", "")) //Reduce to lowercase no whitespace

    var image = pattern.append("svg:image")
        .attr("x", "0%")
        .attr("y", "0%")
        .attr("width", 512)
        .attr("height", 512)
        .attr("xlink:href", d => "img/" + d.toLowerCase().replace(/ /g,'').replace("&", "") + ".png") //Reduce to lowercase no whitespace

    for (key in Object.keys(colorset)) {
        let genre = Object.keys(colorset)[key];
        genre = genre.toLowerCase().replace(/ /g,'').replace("&", "")
        var circles = svg
            .append("circle")
            .attr("r", 0)
            .style("filter", "brightness(100%)")
            .style("fill", "green")
    }
}

function draw_bubbles(week_index) {
    if (week_index < 0 || week_index > data["weeks"].length) return;
    // Resize the plot if needed
    const bubbleDiv = document.getElementById("bubbles_div");
    const totalWidth = Math.floor(bubbleDiv.clientWidth * 0.9 / 20) * 20;
    const totalHeight = (bubbleDiv.clientHeight - 60);
    if (totalWidth != d3.select("#bubbles").attr("width")) {
        d3.select("#bubbles")
            .attr("width", totalWidth)
            .attr("height", totalHeight);
    }
    const maxHeight = totalHeight / 2;

    // Draw circles
    const about = data["weeks"][week_index];

    // Packing code for non overlapping of bubbles
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

    // Define the properties of the circles in the HTML
    var circles = d3.select("#bubbles").selectAll("circle")
        .data(nodes)
        .style("fill", function(d) {
            let name  = d.data.name;
            name = name.toLowerCase().replace(/ /g,'').replace("&", ""); // Format needed for loading of image
            return "url(#circle" + name + ")";
        })
        .attr("r", d => getRadius(d, sumPopularity, maxHeight))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        // Mouse Events
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration("500")
                .style("filter", "brightness(75%)")
                .attr("r", d => Math.max(getRadius(d, sumPopularity, maxHeight) + 25, 75))
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration("250")
                .style("filter", "brightness(100%)")
                .attr("r", d => getRadius(d, sumPopularity, maxHeight))
        })
        .on("click", (event, genre) => {
            active_info_genre = genre.data.name;
            showData(sliderAxis.value());
        });
}

// Normalizes the radius to prevent out of bounds and overlapping bubbles
function getRadius(d, sum, maxHeight) {
    let entry = d.data
    let radius = entry == null ? 0 : entry.value // Prevents showing invalid entries
    radius = radius > 0 ? maxHeight * (radius / sum) : 0
    return radius;
}

// Helper function, transforms the data in correct notation for D3 Hierarchy
function transformDataToGroup(data) {
    let result = [];
    for (var key in data) {
        // Filter out unused genres for easier packing of bubbles
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
    add_slider_callback(showDataDelayed);
}).catch(function(err) {
    console.log(err);
})
