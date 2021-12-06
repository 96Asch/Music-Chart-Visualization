const sliderWidth = 700;
const sliderCallbacks = [draw, draw_duplicates_plot];


function create_slider(data) {

    const yAxis = d3.sliderBottom()
    .min(0).max(42).step(1)
    .width(sliderWidth - 100)
    .displayValue(false)
    .on('onchange', (val) => {
        for (const cb of sliderCallbacks) cb(val);
    });

    const slider = d3.select('#slider')
    .append('svg')
    .attr('width', sliderWidth)
    .attr('height', 90)
    .append('g')
    .attr('transform', 'translate(42,30)')
    .attr('id', "somebs")
    .call(yAxis);

    if (data !== undefined) {
        console.log(data["weeks"].length)
        yAxis.max(data["weeks"].length - 2)
            .tickFormat((i) => data["weeks"][i].week.substring(0, 4));
            
        const ssvg = d3.select('#slider > svg > g');
        ssvg.selectAll("*").remove();
        ssvg.call(yAxis);
        yAxis.value(Math.floor(data["weeks"].length / 2));
    }

    return slider
}
