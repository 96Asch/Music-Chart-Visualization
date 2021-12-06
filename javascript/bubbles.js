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

var data = undefined;
const sliderWidth = 700;
const sliderCallbacks = [draw];
const sharedSlider = d3.sliderBottom()
    .min(0).max(42).step(1)
    .width(sliderWidth - 100)
    .displayValue(false)
    .on('onchange', (val) => {
        for (const cb of sliderCallbacks) cb(val);
    });

function set_data(newdata) {
    if (data !== undefined) return;
    data = newdata;
    sharedSlider.max(data["weeks"].length - 2)
        .tickFormat((i) => data["weeks"][i].week.substring(0, 4));
    const ssvg = d3.select('#slider > svg > g');
    ssvg.selectAll("*").remove();
    ssvg.call(sharedSlider);
    sharedSlider.value(Math.floor(data["weeks"].length / 2));
}

function create_svgs() {
    // NOTE this function is called before the data is there.
    // Thus don't use the 'data' variable in this function!
    // Create a slider SVG
    d3.select('#slider')
        .append('svg')
        .attr('width', sliderWidth)
        .attr('height', 90)
        .append('g')
        .attr('transform', 'translate(42,30)')
        .attr('id', "somebs")
        .call(sharedSlider);
    // Create bubble SVG
    var bubble = d3.select("#bubbles")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 500");
    // Initialize all circles
    var node = bubble.append("g")
        .selectAll("circle").data(Object.keys(colorset))
        .enter().append("circle")
        .style("stroke", "gray")
        .style("fill", (d, i) => colorset[d])
        .attr("r", (genre) => 0)
        .attr("cx", (d, i) => 50 + (i * 30))
        .attr("cy", (d, i) => 50 + Math.random() * 100);
}

function draw(week_index) {
    if (week_index < 0 || week_index > data["weeks"].length) return;
    const about = data["weeks"][week_index];
    const topsong = about.songs[0];
    document.getElementById("toptext").innerHTML = (about.week + "  [Top song: "
        + topsong.features.title + " - " + topsong.features.artist + "]");
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


create_svgs();
promise_genre_popularity().then(function(newdata) {
    set_data(newdata);
}).catch(function(err) {
    console.log(err);
})
