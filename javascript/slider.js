var data = { };

function add_data(key, newdata) {
    if (data[key] !== undefined) return;
    console.log("Updating " + key + " data");
    data[key] = newdata;
    if (key === "weeks") update_slider_time();
}

/////////////////// Creating the slider

const sliderWidth = 700;
const sliderCallbacks = [];

const yAxis = d3.sliderBottom()
    .min(0).max(42).step(1)
    .width(sliderWidth - 100)
    .displayValue(false)
    .on('onchange', (val) => {
        for (const cb of sliderCallbacks) cb(val);
    });

const slider = d3.select('#slider > svg')
    .attr('width', sliderWidth)
    .attr('height', 90)
    .append('g')
    .attr('transform', 'translate(42,30)')
    .attr('id', "somebs")
    .call(yAxis);

function update_slider_time() {
    const weekdata = data["weeks"];
    if (weekdata === undefined) return;

    yAxis.max(weekdata.length - 2)
        .tickFormat((i) => weekdata[i].week.substring(0, 4));
    const ssvg = d3.select('#slider > svg > g');
    ssvg.selectAll("*").remove();
    ssvg.call(yAxis);
    yAxis.value(Math.floor(weekdata.length / 2));
}

function add_slider_callback(cb) {
    sliderCallbacks.push(cb);
    cb(yAxis.value());
}
