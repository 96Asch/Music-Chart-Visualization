
const margin = {top: 10, right: 30, bottom: 30, left: 40};
const dup_colors = new Map();

var highest_n = 15;
var highest_words = [];
var current_year = "";
var previousYear = "";
var maxYear = "", minYear = "";
var lastIndex = 0;

function switchRepeats() {
    const switchb = document.getElementById("repeat_switch");
    const options = ["Switch to repeats per song", "Switch to yearly repeats"];
    const innerNow = switchb.innerHTML.trim();
    if (innerNow == options[0]) {
        switchb.innerHTML = options[1];

    } else if (innerNow == options[1]){
        switchb.innerHTML = options[0];

    } else {
        console.log("Unknown switch option: " + innerNow);
    }
}

function set_year_bounds(dupdata) {
    const sortedByYears = d3.sort(dupdata, function(a, b) {
        return d3.ascending(a["year"], b["year"]);
    });

    maxYear = sortedByYears.at(-1)["year"];
    minYear = sortedByYears.at(0)["year"];
}

function init_duplicates_plot() {
    const svg = d3.select("#duplicates > svg");
    const gmain = svg.append("g").attr("id", "dd_main");
    const lines = gmain.append("g").attr("id", "dd_lines");
    gmain.append("g").attr("id", "dd_axis_bottom");
    gmain.append("g").attr("id", "dd_axis_left");
    gmain.attr("stroke", "white").attr("color", "white");

    const index_data = [...Array(highest_n).keys()];
    lines.selectAll("line")
        .data(index_data)
        .join(
            function(enter) {
                return enter.append("line");
            }
        )


    lines.selectAll("circle")
        .data(index_data)
        .join(
            function(enter) {
                return enter.append("circle");
            }
        )
}

function random_color() {
    return "#" + Math.floor( Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}

function init_color_map(data) {
    data.forEach(yearData => {
        yearData["words"].forEach(word => {
            if (!dup_colors.has(word["word"])) {
                dup_colors.set(word["word"], random_color());
            }
        })
    })
}

function draw_duplicates_plot(week_index) {
    const weeks_data = data["weeks"];
    const duplicate_words_data = data["duplicates"];
    if (duplicate_words_data === undefined || weeks_data === undefined) return;

    if (week_index < 0 || week_index > weeks_data.length) return;
    const currentYear = weeks_data[week_index]["week"].substring(0,4);
    if (currentYear < minYear || currentYear > maxYear) return;

    ////////  Sizing /////////////

    const dupesDiv = document.getElementById("duplicates");
    const totalWidth = Math.floor(dupesDiv.clientWidth * 0.9 / 50) * 50;
    if (totalWidth == d3.select("#duplicates > svg").attr("width") &&
        currentYear == previousYear) return;
    // little less heigh to prevent growing due to missize between svg and div
    const totalHeight = dupesDiv.clientHeight * 0.95;
    svg_width = totalWidth - margin.left - margin.right,
    svg_height = totalHeight - margin.top - margin.bottom;

    const gmain = d3.select("#duplicates > svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .select("#dd_main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    ////////  Data stuff /////////////

    previousYear = currentYear;
    lastIndex = week_index;


    highest_words = d3.sort(duplicate_words_data.filter(function(it) {
            return it["year"] == currentYear;
        })[0]["words"], function(a, b) {
            return d3.descending(a["ratio"], b["ratio"]);
        });

    const numShow = Math.min(highest_words.length, highest_n);

    highest_words = highest_words.slice(0, numShow);


    ////////  Axes /////////////

    const xAxis = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([ 0, svg_width]);

    const yAxis = d3.scaleBand()
        .domain(highest_words.map((d) => d["word"]))
        .range([0, svg_height])
        .padding(1);

    gmain.select("#dd_axis_bottom")
        .attr("transform", "translate(0," + svg_height + ")")
        .call(d3.axisBottom(xAxis))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    gmain.select("#dd_axis_left")
        .call(d3.axisLeft(yAxis));

    //////// Lollipop plot ///////////////

    const lines = gmain.select("#dd_lines");

    lines.selectAll("line")
        .attr("x1", function(d) { return xAxis(0); })
        .attr("x2", xAxis(0))
        .attr("y1", function(d) { return yAxis(highest_words[d]["word"]); })
        .attr("y2", function(d) { return yAxis(highest_words[d]["word"]); })
        .style("stroke", function (d, i) { return dup_colors.get(highest_words[d]["word"]); });

    lines.selectAll("circle")
        .attr("cx", function(d) { return xAxis(highest_words[d]["ratio"]); })
        .attr("cy", function(d) { return yAxis(highest_words[d]["word"]); })
        .attr("r", "3")
        .attr("fill-opacity", 0.0)
        .attr("stroke-opacity", 0.0)
        .attr("fill", function (d, i) { return dup_colors.get(highest_words[d]["word"]); });

    lines.selectAll("line")
        .transition()
        .duration(800)
        .attr("x1", function(d) { return xAxis(highest_words[d]["ratio"]); })
        .attr("width", function(d) { return svg_width - xAxis(d["ratio"]); })
        .delay(function(d, i) { return(i * 100) });

    lines.selectAll("circle")
        .transition()
        .duration(900)
        .attr('fill-opacity', 1.0)
        .delay(function(d, i) { return(i * 100) });
}


init_duplicates_plot();

window.onresize = () => draw_duplicates_plot(lastIndex);

d3.json('data/duplicate_words/dup_words.json').then(function(dupdata) {
    set_year_bounds(dupdata);
    init_color_map(dupdata);
    add_data("duplicates", dupdata);
    add_slider_callback(draw_duplicates_plot);
});

d3.json('data/song_data_bb.json').then(function(data) {
    data.forEach(yeardata => {
        yeardata.songs = yeardata.songs.map(song => {
            return {
                "title": song.title,
                "artist": song.artist,
                "repeat": song.num_lines / song.num_dupes
            };
        });
    });
    console.log(data);
});
