
const margin = {top: 10, right: 30, bottom: 30, left: 40};
const dup_colors = new Map();

var highest_n = 15;
var highest_words = [];
var current_year = "";
var previousYear = "";
var maxYear = "", minYear = "";

const switchOptions = ["Switch to repeats per song", "Switch to yearly repeats"];
function switchRepeats() {
    const switchb = document.getElementById("repeat_switch");
    const innerNow = switchb.innerHTML.trim();
    if (innerNow == switchOptions[0]) {
        switchb.innerHTML = switchOptions[1];
    } else if (innerNow == switchOptions[1]){
        switchb.innerHTML = switchOptions[0];
    } else {
        console.log("Unknown switch option: " + innerNow);
    }
    draw_one_of_the_plots(sliderAxis.value(), true);
}

function process_dup_data(dupdata) {
    // Set the min and max years
    const sortedByYears = d3.sort(dupdata, function(a, b) {
        return d3.ascending(a["year"], b["year"]);
    });

    maxYear = sortedByYears.at(-1)["year"];
    minYear = sortedByYears.at(0)["year"];

    // Create the color map
    dupdata.forEach(yearData => {
        yearData["words"].forEach(word => {
            if (!dup_colors.has(word["word"])) {
                const rnd = "#" + Math.floor( Math.random() * 16777215)
                    .toString(16).padStart(6, '0').toUpperCase();
                dup_colors.set(word["word"], rnd);
            }
        })
    });
}

function get_repeat_buckets(repeats) {
    const into_buckets = highest_n;
    // Bucket 0 will contain [0, 1/buckets], 1 constains (1/buckets, 2/buckets]
    const buckets = [...Array(into_buckets).keys()].map(() => []);
    for (song of repeats.songs) {
        var inBucket = Math.min(Math.floor(song["repeat"] * buckets.length), buckets.length - 1);
        buckets[inBucket].push(song);
    }
    return buckets;
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
        .join((enter) => enter.append("line"));
    lines.selectAll("circle")
        .data(index_data)
        .join((enter) => enter.append("circle"));
}

function draw_one_of_the_plots(week_index, force=false) {
    // Both of them need the year, so calculate that first
    const weeks_data = data["weeks"];
    if (weeks_data === undefined) return;
    if (week_index < 0 || week_index > weeks_data.length) return;
    const currentYear = weeks_data[week_index]["week"].substring(0,4);
    if (currentYear < minYear || currentYear > maxYear) return;

    // Also resize the thing to a nice size
    const dupesDiv = document.getElementById("duplicates");
    const totalWidth = Math.floor(dupesDiv.clientWidth * 0.9 / 50) * 50;
    if (totalWidth == d3.select("#duplicates > svg").attr("width") &&
        currentYear == previousYear && force != true) return;
    // little less heigh to prevent growing due to missize between svg and div
    const totalHeight = dupesDiv.clientHeight * 0.95;
    svg_width = totalWidth - margin.left - margin.right,
    svg_height = totalHeight - margin.top - margin.bottom;
    d3.select("#duplicates > svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .select("#dd_main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Finally we draw the right plot of course
    const switchb = document.getElementById("repeat_switch");
    const innerNow = switchb.innerHTML.trim();
    if (innerNow == switchOptions[1]) { // Show repeats per song
        draw_song_repeats_plot(currentYear, svg_width, svg_height);
        previousYear = currentYear;
    } else if (innerNow == switchOptions[0]){ // Yearly duplicates
        draw_duplicates_plot(currentYear, svg_width, svg_height);
        previousYear = currentYear;
    }
}

function draw_duplicates_plot(currentYear, svg_width, svg_height) {
    const duplicate_words_data = data["duplicates"];
    if (duplicate_words_data === undefined) return;

    const gmain = d3.select("#duplicates > svg > #dd_main");

    ////////  Data stuff /////////////

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
        .duration(300)
        .attr("x1", function(d) { return xAxis(highest_words[d]["ratio"]); })
        // .attr("width", function(d) { return svg_width - xAxis(d["ratio"]); })
        .delay(function(d, i) { return(i * 20) });

    lines.selectAll("circle")
        .transition()
        .duration(400)
        .attr('fill-opacity', 1.0)
        .delay(function(d, i) { return(i * 20) });
}

function draw_song_repeats_plot(year) {
    const repeatsPerYear = data["repeats"];
    if (repeatsPerYear === undefined) return;
    const buckets = repeatsPerYear[year];
    if (buckets === undefined) return;
    const gmain = d3.select("#duplicates > svg > #dd_main");

    ////////  Axes /////////////

    const biggest = buckets.reduce((res, b) => Math.max(res, b.length), 0) + 1;
    const bucketiToPercent = (i) => ((i / buckets.length).toString()+"00").substring(0, 4);
    const bucketiAmount = (i) => buckets[i].length / biggest;

    const xAxis = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([ 0, svg_width]);

    const yAxis = d3.scaleBand()
        .domain(buckets.map((_, i) => bucketiToPercent(i)))
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
        .attr("y1", function(d) { return yAxis(bucketiToPercent(d)); })
        .attr("y2", function(d) { return yAxis(bucketiToPercent(d)); })
        .style("stroke", "white");

    lines.selectAll("circle")
        .attr("cx", function(d) { return xAxis(bucketiAmount(d)); })
        .attr("cy", function(d) { return yAxis(bucketiToPercent(d)); })
        .attr("r", "3")
        .attr("fill-opacity", 0.0)
        .attr("stroke-opacity", 0.0)
        .attr("fill", "white");

    lines.selectAll("line")
        .transition()
        .duration(300)
        .attr("x1", function(d) { return xAxis(bucketiAmount(d)); })
        .delay(function(d, i) { return(i * 20) });

    lines.selectAll("circle")
        .transition()
        .duration(400)
        .attr('fill-opacity', 1.0)
        .delay(function(d, i) { return(i * 20) });
}


init_duplicates_plot();

d3.json('data/duplicate_words/dup_words.json').then(function(dupdata) {
    process_dup_data(dupdata);
    add_data("duplicates", dupdata);
    add_slider_callback(draw_one_of_the_plots);
});

d3.json('data/song_data_bb.json').then(function(data) {
    add_data("repeats", data.reduce((res, yeardata) => {
        yeardata.songs = yeardata.songs.map(song => {
            return {
                "title": song.title,
                "artist": song.artist,
                "repeat": Math.min(1, song.num_dupes / song.num_lines)
            };
        });
        res[yeardata["year"]] = get_repeat_buckets(yeardata);
        return res;
    }), {});
    add_slider_callback(draw_one_of_the_plots);
});
