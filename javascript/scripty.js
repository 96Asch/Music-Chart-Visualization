
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

// append the svg object to the body of the page
// const duplicates_svg = d3.select("#duplicates")
//     .append("svg")
//     .attr("width", svg_width + margin.left + margin.right)
//     .attr("height", svg_height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + "," + margin.top + ")");


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





    // // Get array of the max values per year
    // const max_dup_counts = []
    // data.forEach(function(year_object, index){
    //     const counts = [0];
    //     year_object["words"].forEach(function(obj) {
    //         this.push(obj["count"]);
    //     }, counts)
    //     this.push(d3.max(counts));
    // }, max_dup_counts)
    //
    // const maxVal = d3.max(max_dup_counts);
    // const maxValRoundedTen = Math.ceil(maxVal / 10) * 10;
    //
    // console.log(maxVal);
    //
    // ////////  Axes /////////////
    // const xAxis = d3.scaleLinear()
    //             .domain([0, maxValRoundedTen])
    //             .range([ 0, svg_width]);
    //
    // const highest_words = d3.sort(data.filter(function(it) {
    //                             return it["year"] == (1950 + selected_year_i).toString();
    //                         })[0]["words"], function(a, b) {
    //                             return d3.descending(a["count"], b["count"]);
    //                         }).slice(0, highest_n);
    //
    // console.log(highest_words)
    //
    // const yAxis = d3.scaleBand()
    //             .domain(highest_words.map(function(d) {
    //                 return d["word"];
    //             }))
    //             .range([0, svg_height])
    //             .padding(1);
    //
    // duplicates_svg.append("g")
    //     .attr("transform", "translate(0," + svg_height + ")")
    //     .call(d3.axisBottom(xAxis))
    //     .selectAll("text")
    //     .attr("transform", "translate(-10,0)rotate(-45)")
    //     .style("text-anchor", "end");
    //
    // duplicates_svg.append("g")
    //     .call(d3.axisLeft(yAxis));
    // //////////////////////////////////////
    //
    // //////// Lollipop plot ///////////////
    //
    //
    // duplicates_svg.selectAll("lollipop_lines")
    //             .data(highest_words)
    //             .enter()
    //             .append("line")
    //                 .attr("x1", function(d) { return xAxis(d["count"]); })
    //                 .attr("x2", xAxis(0))
    //                 .attr("y1", function(d) { return yAxis(d["word"]); })
    //                 .attr("y2", function(d) { return yAxis(d["word"]); })
    //                 .attr("stroke", "black");
    //
    //
    // duplicates_svg.selectAll("lollipop_circles")
    //             .data(highest_words)
    //             .enter()
    //             .append("circle")
    //                 .attr("cx", function(d) { return xAxis(d["count"]); })
    //                 .attr("cy", function(d) { return yAxis(d["word"]); })
    //                 .attr("r", "2")
    //                 .attr("stroke", "black");
    // //////////////////////////////////////
    //
    // const start_process_data = performance.now();
    // console.log(`Getting files took ${Math.trunc(
    //     start_process_data-start_get_data)} ms`);

})
