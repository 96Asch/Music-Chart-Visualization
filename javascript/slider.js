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

function run_slider_callbacks(val) {
    for (const cb of sliderCallbacks) cb(val);
    if (data["weeks"] === undefined) return;
    const about = data["weeks"][val];
    if (about === undefined) return;
    const topsong = about.songs[0];
    document.getElementById("toptext").innerHTML = (about.week + "    [Top song: "
        + topsong.features.title + " - " + topsong.features.artist + "]");
}

function update_slider_time() {
    const weekdata = data["weeks"];
    if (weekdata === undefined) return;

    sliderAxis.max(weekdata.length - 2)
        .tickFormat((i) => weekdata[i].week.substring(0, 4));
    const ssvg = d3.select('#slider > svg > g');
    ssvg.selectAll("*").remove();
    ssvg.call(sliderAxis);
    sliderAxis.value(Math.floor(weekdata.length / 2));
}

function add_slider_callback(cb) {
    if (sliderCallbacks.includes(cb)) return;
    sliderCallbacks.push(cb);
    cb(sliderAxis.value());
}

const sliderAxis = d3.sliderBottom()
    .min(0).max(42).step(1)
    .width(sliderWidth - 100)
    .displayValue(false)
    .on('onchange', run_slider_callbacks);

const slider = d3.select('#slider > svg')
    .attr('width', sliderWidth)
    .attr('height', 90)
    .append('g')
    .attr('transform', 'translate(42,30)')
    .attr('id', "somebs")
    .call(sliderAxis);

window.onresize = () => run_slider_callbacks(sliderAxis.value());
