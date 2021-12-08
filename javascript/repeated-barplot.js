
const margin = {top: 10, right: 30, bottom: 30, left: 40};

var highest_n = 15;
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

// Get the (rounded) max number of words in the dataset.
function get_max_value(data, isRounded) {
    const max_dup_counts = []
    data.forEach(function(year_object, index){
        const counts = [0];
        year_object["words"].forEach(function(obj) {
            this.push(obj["count"]);
        }, counts)
        this.push(d3.max(counts));
    }, max_dup_counts)
    var maxVal = d3.max(max_dup_counts);
    if (isRounded) {
        maxVal = Math.ceil(maxVal / 10) * 10;
    }
    return maxVal;
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
        .enter()
        .append("line");
    lines.selectAll("circle")
        .data(index_data)
        .enter()
        .append("circle");
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

    const maxValRoundedTen = get_max_value(duplicate_words_data, true);
    const highest_words = d3.sort(duplicate_words_data.filter(function(it) {
            return it["year"] == currentYear;
        })[0]["words"], function(a, b) {
            return d3.descending(a["count"], b["count"]);
        }).slice(0, highest_n);

    ////////  Axes /////////////

    const xAxis = d3.scaleLinear()
        .domain([0, maxValRoundedTen])
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
        .attr("x1", function(d) { return xAxis(highest_words[d]["count"]); })
        .attr("x2", xAxis(0))
        .attr("y1", function(d) { return yAxis(highest_words[d]["word"]); })
        .attr("y2", function(d) { return yAxis(highest_words[d]["word"]); })
        .attr("stroke", "white");

    lines.selectAll("circle")
        .attr("cx", function(d) { return xAxis(highest_words[d]["count"]); })
        .attr("cy", function(d) { return yAxis(highest_words[d]["word"]); })
        .attr("r", "2")
        .attr("stroke", "white");
}


init_duplicates_plot();

window.onresize = () => draw_duplicates_plot(lastIndex);

d3.json('data/duplicate_words/dup_words.json').then(function(dupdata) {
    set_year_bounds(dupdata);
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
