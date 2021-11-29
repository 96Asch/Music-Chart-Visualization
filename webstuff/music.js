// for "Unexpected token ]" search for regex ",\n *]" in json
const fileTopList   = "/data/hot_stuff_2.csv"
const fileHierarchy = "/data/unique_hierarchy.json"
const fileFeatures  = "/data/hot_100_audio_features.csv"







Promise.all([
    d3.csv(fileTopList),
    d3.json(fileHierarchy),
    d3.csv(fileFeatures)
]).then(function(data) {

    // Get audio features as map of (songId) -> features
    const songFeatures = { }
    for (var i = 0; i < data[2].length; i++) {
        const about = data[2][i]
        songFeatures[about.songid] = {
            "track": about.spotify_track_id,
            "genre": about.spotify_genre,
            "artist": about.performer,
            "title": about.song
        }
    }

    // Get the song ids, and at the same time a list of rankings
    const songIds = new Set();
    const songs = data[0].filter(function(item) {
        if (songIds.has(item.songid)) return false;
        songIds.add(item.songid);
        return true;
    });

    // Create a hierarchy genre lookup tree


    console.log(songFeatures["The Sound Of SilenceDisturbed"]);
}).catch(function(err) {
    console.log(err);
})
