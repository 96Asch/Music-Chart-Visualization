// for "Unexpected token ]" search for regex ",\n *]" in json
const json_spotify_genres = "/data/genres_hierarchy.json"
const json_song_data_bb = "/data/song_data_bb.json"

// Measuring time taken by certain segments (like data loading)
var last_seg = ["", -1];
function start(seg_name) {
    const start_time = performance.now();
    if (last_seg[1] != -1) {
        const time = Math.trunc(start_time - last_seg[1]);
        console.log(`${last_seg[0]} took ${time} ms`);
    };
    last_seg = [seg_name, start_time];
};

// Get the song rankings as a dictionary by week
const song_rankings = "/data/song_ranking_small.csv";
function song_rankings_weekly_list() {
    return d3.csv(song_rankings).then(function(data) {
        // First group all entries by week, into a dictionary.
        // https://stackoverflow.com/a/34890276/7857013
        const rankingsDict = data.reduce(function(result, x) {
            (result[x.weekid] = result[x.weekid] || []).push(x);
            return result;
        }, {});
        // Then create a list from that, sorted by week.
        const weekList = Object.keys(rankingsDict);
        weekList.sort();
        const rankingsList = weekList.map(key => { return {
            "songs": rankingsDict[key],
            "week": key
        }});
        return rankingsList;
    });
}

// Get the features as a map (songId) -> features
const song_features = "/data/song_features.csv"
function song_features_dict() {
    return d3.csv(song_features).then(function(data) {
        const songFeatures = { };
        for (var i = 0; i < data[2].length; i++) {
            const about = data[2][i]
            songFeatures[about.songid] = {
                "popularity": about.spotify_track_popularity,
                "track": about.spotify_track_id,
                "genre": about.spotify_genre,
                "artist": about.performer,
                "title": about.song
            };
        };
    });
}


start("Getting data");
Promise.all([
    d3.json(json_spotify_genres),
    d3.json(json_song_data_bb),
    song_features_dict(),
    song_rankings_weekly_list()
]).then(function([jg, jd, features, rankings]) {
    console.log(rankings.slice(0, 10));

    // Get the song ids
    // let songIds = new Set(data[0].map(i => i.song + i.performer));

    // Get audio features as map of (songId) -> features
    // const songs = data[2].flatMap(yearobj => yearobj.songs);
    // const songFeatures = songs.reduce((res,x) => ({...res, [x.title + x.artist]: x}), {});



    //

    // console.log(songIds);
    // console.log("Total songs: " + songIds.size);
    // const notIn = [...songIds].filter(id => (id in songFeatures));
    // console.log("In features: " + notIn.length);
    // return;


    // For the rankings: group them by week


    start("Show stuff");

    // todo Create a hierarchy genre lookup tree
    // console.log(songFeatures["The Sound Of SilenceDisturbed"]);
    // console.log(rankingsList.slice(0, 5));
}).catch(function(err) {
    console.log(err);
})
