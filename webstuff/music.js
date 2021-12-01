// for "Unexpected token ]" search for regex ",\n *]" in json
const fileTopList   = "/data/song_ranking.csv"
const fileHierarchy = "/data/genres_hierarchy_unique.json"
const fileFeatures  = "/data/song_features.csv"

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

    // Get the song ids
    const songIds = new Set(data[0].map(item => item.songid));

    // For the rankings: group them by week
    // https://stackoverflow.com/a/34890276/7857013
    const rankingsDict = data[0].reduce(function(result, x) {
        (result[x.weekid] = result[x.weekid] || []).push(x);
        return result;
    }, {});
    var rankingsList = Object.keys(rankingsDict);
    rankingsList.sort();
    console.log(rankingsList);
    rankingsList = rankingsList.map(key => {
        const top100 = rankingsDict[key];
        top100.week = key;
        return top100;
    });

    // todo Create a hierarchy genre lookup tree
    console.log(songFeatures["The Sound Of SilenceDisturbed"]);
    console.log(rankingsList.slice(0, 5));
}).catch(function(err) {
    console.log(err);
})
