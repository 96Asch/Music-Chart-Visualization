

function init_features_plot() {
    const svg = d3.select("#features > svg");
    const gmain = svg.append("g").attr("id", "feat_main");
    const points = gmain.append("g").attr("id", "feat_points");
    gmain.append("g").attr("id", "feat_axis_bottom");
    gmain.append("g").attr("id", "feat_axis_left");
    gmain.attr("stroke", "white").attr("color", "white");

    const index_data = [...Array(100).keys()];

    points.selectAll("circle")
        .data(index_data)
         .join(
        function(enter) { return enter.append("circle"); },
        function(update) { return update; },
        function(exit) { return exit.remove(); }
    );
}

function draw_feature_plot(week_index, force=false) {
    const weeks_data = data["weeks"];
    if (weeks_data === undefined) return;
    if (week_index < 0 || week_index > weeks_data.length) return;

    const featuresDiv = document.getElementById("features");
    const totalWidth = Math.floor((featuresDiv.clientWidth - 80) / 20) * 20;

    const totalHeight = featuresDiv.clientHeight - 20;
    const feat_svg_width = totalWidth - margin.left - margin.right;
    const feat_svg_height = totalHeight - margin.top - margin.bottom;
    d3.select("#features > svg")
        .attr("width", totalWidth)
        .attr("height", totalHeight)
        .select("#feat_main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    ////////  Data /////////////

    const songData = weeks_data[week_index]["songs"];
    const ness = songData.map((song) => {
        return song.features.speach;
    }).filter((n) => !isNaN(n) && n.length > 0).map(n => Number(n));
    ness.sort();

    ////////  Axes /////////////

    const gmain = d3.select("#features > svg > #feat_main");

    const index_data = [...Array(ness.length).keys()];
    gmain.select("feat_points").selectAll("circle")
        .data(index_data)
        .join(
            function(enter) { return enter.append("circle"); },
            function(update) { return update; },
            function(exit) { return exit.remove(); }
        );



    const xAxis = d3.scaleLinear()
        .domain([0, ness.length])
        .range([0, feat_svg_width]);

    const maxNess = ness[ness.length - 2] + 0.02;
    const yAxis = d3.scaleLinear()
        .domain([Math.max(0.5, maxNess), 0.0])
        .range([0, feat_svg_height]);

    gmain.select("#feat_axis_bottom")
        .attr("transform", "translate(0," + feat_svg_height + ")")
        .call(d3.axisBottom(xAxis)
                .tickFormat(function (d) { return ''; })
                .ticks(10)
                )
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    gmain.select("#feat_axis_left")
        .call(d3.axisLeft(yAxis).ticks(5));

    //////// plot ///////////////

    const points = gmain.select("#feat_points");

    points.selectAll("circle")
        .attr("fill-opacity", 0.0);

    points.selectAll("circle")
        .data(index_data)
        .attr("cx", function(d, i) { return xAxis(i); })
        // Change to feature data;
        .attr("cy", function(d) { return yAxis(ness[d]); })
        .attr("r", "3")
        .attr("fill-opacity", 1.0)
        .attr("stroke-opacity", 0.0)
        .attr("fill", "white");

    // points.selectAll("circle")
    //     .data(index_data)
    //     .transition()
    //     .duration(60)
    //     .attr('fill-opacity', 1.0)
    //     .delay(function(d, i) { return(i * 5) });
}


init_features_plot();
add_slider_callback(draw_feature_plot);
