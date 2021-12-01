// Set overall margins
const margin = {top: 20, right: 30, bottom: 0, left: 10},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

const colorset = {
    'African' : "#69b3a2", 
    'Central Asian' : "#554fa9", 
    'Southeast Asian' : "#e75327", 
    'Avant-garde' : "#c1cd53", 
    'Blues' : "#554fa9", 
    'Caribbean and Caribbean-influenced': "#ce614d", 
    'Country' : "#998b6b", 
    'Easy listening': "#66e5b3", 
    'Electronic': "#e8ef16", 
    'Folk' : "#fdd222", 
    'Hip hop' : "#f49942", 
    'Jazz' : "#f1d252", 
    'Latin' : "#045c0c", 
    'Pop' : "#1e9988", 
    'R&B and Soul' : "#37c7d7", 
    'Rock' : "#9b959a"
}

// Bubble creation
d3.json("data/genres_hierarchy.json").then(function(data) {
    var genres = data.map(d => d.genre) // Read main genres into list
    // Create bubble SVG
    var bubble = d3.select("#bubbles")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    // Initialize all circles
    bubble.selectAll("circle")
        .data(genres)
        .enter().append("circle")
        .style("stroke", "gray")
        .style("fill" , function(d, i) {
            return colorset[d]
        })
        .attr("r", 10)
        .attr("cx", function(d, i){return 50 + (i*30)})
        .attr("cy", function(d, i) {
            return 50 + Math.random() * 100
        })
        .on("mouseover", function(event, d) {
            d3.select(this)
            getSubGenres(d)
        })
        
        function getSubGenres(d) {
            for (var j = 0; j < data.length; j++) {
                if (data[j]["genre"] == d) {
                   console.log(data[j]["subgenre"])
                }
            }
        }

        function draw(size) {
            document.getElementById("year").innerHTML = size
            d3.json("dummy.json").then(function(dummy) {
                // Update the circles
                bubble.selectAll("circle")
                    .attr("r", function(d, i) {
                        var r = dummy[size][d]
                        return r
                    })
                    .attr("cx", function(d, i){
                        var r = dummy[size][d]
                        return 50 + (i*30)
                    })
                    .style("fill-opacity", function(d, i) {
                        var intensity = dummy[size][d] * 0.05
                        return intensity
                    })
            })

        }
        
        // Slider section
        var dataNewYorkTimes = d3.range(1, 41).map(d => ({
            year: d,
            value: 10000 * Math.exp(-(d - 1) / 40),
          }));
        var svg2 = d3
        .select('div#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        
        var padding = 0.1;
        
        var xBand = d3
        .scaleBand()
        .domain(dataNewYorkTimes.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(padding);
        
        var xLinear = d3
        .scaleLinear()
        .domain([
            d3.min(dataNewYorkTimes, d => d.year),
            d3.max(dataNewYorkTimes, d => d.year),
        ])
        .range([
            margin.left + xBand.bandwidth() / 2 + xBand.step() * padding - 0.5,
            width -
            margin.right -
            xBand.bandwidth() / 2 -
            xBand.step() * padding -
            0.5,
        ]);
        
        var slider = g =>
        g.attr('transform', `translate(0,${height - margin.bottom})`).call(
            d3
            .sliderBottom(xLinear)
            .step(1)
            .ticks(4)
            .default(9)
            .on('onchange', value => draw(value))
        );
        
        svg2.append('g').call(slider);
  })