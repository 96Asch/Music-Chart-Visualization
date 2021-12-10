const margin = {top: 10, right: 30, bottom: 30, left: 40};


function createInfoBox(song) {
    const box = document.createElement("div");
    box.setAttribute("class", "infobox")
    const title = document.createElement("div");
    title.appendChild(document.createTextNode(song["song"]));
    const artist = document.createElement("div")
    artist.appendChild(document.createTextNode(song["performer"]));
    const position = document.createElement("div")
    position.appendChild(document.createTextNode(song["week_position"]));

    box.appendChild(position);
    box.appendChild(title);
    box.appendChild(artist);

    return box;
}

function showData(genre) {
    const weekData = data["weeks"][sliderAxis.value()]["songs"];

    const genreFiltered = weekData.filter(function(d) { 
        for (const subgenre of d["features"]["genres"]) {
            if (genre.data.name == data["genres"].top_genre_of(subgenre)) {
                return true;
            }
        }
        return false;
    });

    const genreSorted = genreFiltered.sort(function(a, b) {
        return a["week_position"] - b["week_position"];
    })

    const title = document.getElementById("infoTitle");
    title.removeChild(title.firstChild);
    title.appendChild(document.createTextNode("Top songs for " + genreSorted[0]["weekid"]));

    console.log(genreSorted);

    const infobox = document.getElementById("infobox");
    infobox.innerHTML = '';

    genreSorted.forEach(function(song) {
        const box = createInfoBox(song);
        infobox.appendChild(box);
    })


    
}