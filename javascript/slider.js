var data = { };

function add_data(key, newdata) {
    if (data[key] !== undefined) return;
    console.log("Updating " + key + " data");
    data[key] = newdata;
    if (key === "weeks") update_slider_time();
    run_slider_callbacks(sliderAxis.value());
}

/////////////////// Creating the slider

const sliderWidth = 700;
const sliderCallbacks = [];

function run_slider_callbacks(val) {
    for (const cb of sliderCallbacks) cb(val);
    if (data["weeks"] === undefined) return;
    const about = data["weeks"][val];
    if (about === undefined) return;
    // Set the top texts:
    const topsong = about.songs[0];
    document.getElementById("date_text").innerHTML = about.week
    document.getElementById("top_song_text").innerHTML = ("[Top song: "
        + topsong.features.title + " - " + topsong.features.artist + "]");
    // Set event text:
    const event_text = document.getElementById("event_text");
    if (data["events"] === undefined) {
        event_text.innerHTML = "";
        return;
    }
    const memory_for = 15;
    for (let i = 0; i < memory_for; i++) {
        if (val - i < 0) continue;
        const week = data["weeks"][val - i];
        const ev = data["events"][week.week];
        if (ev === undefined) continue;
        event_text.innerHTML = ev;
        event_text.style.opacity = (1 - (i / memory_for));
        return;
    }
    event_text.innerHTML = "";
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

d3.json("/data/big_events.json").then(function (data) {
    add_data("events", data);
});

window.onresize = () => run_slider_callbacks(sliderAxis.value());
