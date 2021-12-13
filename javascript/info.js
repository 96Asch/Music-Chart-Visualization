const margin = {top: 10, right: 30, bottom: 30, left: 40};

active_info_genre="pop";

function createInfoBox(index, song, subgenre, animation=false) {
    const box = document.createElement("div");
    box.setAttribute("class", "with-flex-rows infobox faded-out");

    const position = document.createElement("div")
    position.appendChild(document.createTextNode(song["week_position"]));
    position.setAttribute("class", "flex-tiny");
    position.setAttribute("id", "infobloc1");

    const container = document.createElement("div");
    container.setAttribute("class", "flex-big");
    container.setAttribute("id", "infobloc2");

    const title = document.createElement("h3");
    title.appendChild(document.createTextNode(song["song"]));
    title.setAttribute("class", "infoheader");

    const artist = document.createElement("p")
    artist.appendChild(document.createTextNode(song["performer"]));

    const genreContainer = document.createElement("div");
    genreContainer.setAttribute("class", "with-flex-rows");
    genreContainer.setAttribute("id", "infoSubgenre");

    const subgenreText = document.createElement("p");
    subgenreText.appendChild(document.createTextNode("Subgenre: "));
    subgenreText.setAttribute("class", "subcontent flex-tiny");

    const genre = document.createElement("p")
    genre.appendChild(document.createTextNode(subgenre));
    genre.setAttribute("class", "subcontent flex-tiny");

    genreContainer.appendChild(subgenreText);
    genreContainer.appendChild(genre);

    box.appendChild(position);

    container.appendChild(title);
    container.appendChild(artist);
    container.appendChild(genreContainer);

    box.appendChild(container);
    if (animation) {
        box.style.transition = "transform ease-out " + (index + 1) * 150 + "ms"
    }

    requestAnimationFrame(() => {
        box.style.transform = "translate(0px, 0px)";
    });

    return box;
}

var show_timeout = undefined;
function showDataDelayed(week_index) {
    if (show_timeout !== undefined) {
        clearTimeout(show_timeout);
        show_timeout = undefined;
    }
    show_timeout = setTimeout(() => showData(sliderAxis.value()), 200);
}

function showData(week_index) {
    if (data["weeks"] === undefined) return;
    if (data["genres"] === undefined) return;
    const weekData = data["weeks"][week_index]["songs"];
    genre = active_info_genre;

    const subgenreList = [];
    const genreFiltered = weekData.filter(function(song) {
        for (const subgenre of song["features"]["genres"]) {
            if (genre == data["genres"].top_genre_of(subgenre)) {
                subgenreList.push(subgenre);
                return true;
            }
        }
        return false;
    });

    if (genreFiltered.length == 0) return;

    const title = document.getElementById("infoTitle");
    title.removeChild(title.firstChild);

    const genreName = genre[0].toUpperCase() + genre.substring(1);
    title.appendChild(document.createTextNode("Top songs in " + genreName +" for " + genreFiltered[0]["weekid"]));

    const infobox = document.getElementById("infobox");
    infobox.innerHTML = '';

    genreFiltered.forEach(function(song, index, _) {
        const box = createInfoBox(index, song, subgenreList[index]);
        infobox.appendChild(box);
    })

    const topDiv = document.getElementById("show_area");
    topDiv.scrollTop = 0;

}
