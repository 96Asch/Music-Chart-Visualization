const margin = {top: 10, right: 30, bottom: 30, left: 40};


function createInfoBox(index, song, subgenre) {
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
    // artist.setAttribute("class", "flex-small");

    const genre = document.createElement("p")
    genre.appendChild(document.createTextNode(subgenre));
    genre.setAttribute("id", "infoSubgenre");

    box.appendChild(position);
    
    container.appendChild(title);
    container.appendChild(artist);
    container.appendChild(genre);

    box.appendChild(container);
    box.style.transition = "transform ease-out " + (index + 1) * 150 + "ms"

    requestAnimationFrame(() => {
        box.style.transform = "translate(0px, 0px)";
    });

    return box;
}

function showData(genre) {
    const weekData = data["weeks"][sliderAxis.value()]["songs"];

    const subgenreList = []
    const genreFiltered = weekData.filter(function(d) { 
        for (const subgenre of d["features"]["genres"]) {
            if (genre.data.name == data["genres"].top_genre_of(subgenre)) {
                subgenreList.push(subgenre);
                return true;
            }
        }
        return false;
    });
    

    const title = document.getElementById("infoTitle");
    title.removeChild(title.firstChild);
    title.appendChild(document.createTextNode("Top songs for " + genreFiltered[0]["weekid"]));

    const infobox = document.getElementById("infobox");
    infobox.innerHTML = '';

    genreFiltered.forEach(function(song, index, _) {
        const box = createInfoBox(index, song, subgenreList[index]);
        infobox.appendChild(box);
    })


    
}