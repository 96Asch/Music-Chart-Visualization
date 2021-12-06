
const start_get_data = performance.now();

const margin = {top: 10, right: 30, bottom: 90, left: 40},
svg_width = 1200 - margin.left - margin.right,
svg_height = 800 - margin.top - margin.bottom;

var selected_year_i = 50;
var highest_n = 15;
var current_year = "";
var duplicate_words_data = undefined;
// append the svg object to the body of the page


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

// Initialize the duplicates plot
// function create_duplicates_plot() {
//     d3.select("#duplicates")
//     .append("svg")
//     .attr("width", svg_width + margin.left + margin.right)
//     .attr("height", svg_height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + "," + margin.top + ")");
  
// }

// Set the duplicates dataset.
function set_duplicates_data(newdata) {
    if (duplicate_words_data !== undefined) return;
    duplicate_words_data = newdata;
}


//TODO change to new week_index
function draw_duplicates_plot(week_index) {

    const duplicates = d3.select("#duplicates")
        .append("svg")
        .attr("width", svg_width + margin.left + margin.right)
        .attr("height", svg_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    const maxValRoundedTen = get_max_value(duplicate_words_data, true);

    ////////  Axes /////////////
    const xAxis = d3.scaleLinear()
                .domain([0, maxValRoundedTen])
                .range([ 0, svg_width]);

    const highest_words = d3.sort(duplicate_words_data.filter(function(it) {
                                return it["year"] == (1950 + selected_year_i).toString();
                            })[0]["words"], function(a, b) { 
                                return d3.descending(a["count"], b["count"]);
                            }).slice(0, highest_n); 

    console.log("highest")
    console.log(highest_words)

    const yAxis = d3.scaleBand()
                .domain(highest_words.map(function(d) {
                    return d["word"];
                }))
                .range([0, svg_height])
                .padding(1);

                duplicates.append("g")
        .attr("transform", "translate(0," + svg_height + ")")
        .call(d3.axisBottom(xAxis))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    duplicates.append("g")
        .call(d3.axisLeft(yAxis));
    //////////////////////////////////////

    //////// Lollipop plot ///////////////


    duplicates.selectAll("lollipop_lines")
                .data(highest_words)
                .enter()
                .append("line")
                    .attr("x1", function(d) { return xAxis(d["count"]); })
                    .attr("x2", xAxis(0))
                    .attr("y1", function(d) { return yAxis(d["word"]); })
                    .attr("y2", function(d) { return yAxis(d["word"]); })
                    .attr("stroke", "black");


    duplicates.selectAll("lollipop_circles")
                .data(highest_words)
                .enter()
                .append("circle")
                    .attr("cx", function(d) { return xAxis(d["count"]); })
                    .attr("cy", function(d) { return yAxis(d["word"]); })
                    .attr("r", "2")
                    .attr("stroke", "black");
    //////////////////////////////////////

    const start_process_data = performance.now();
    console.log(`Getting files took ${Math.trunc(
        start_process_data-start_get_data)} ms`);
       
}

function promise_duplicate_words() {
    return d3.json('data/duplicate_words/dup_words.json')
}


promise_duplicate_words().then(function(newdata) {
    set_duplicates_data(newdata);
    // create_duplicates_plot()
    draw_duplicates_plot(15);
}).catch(function(err) {
    console.log(err);
})
