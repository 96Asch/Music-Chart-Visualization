// for "Unexpected token ]" search for regex ",\n *]" in json
const fileTopList   = "/data/song_ranking.csv"
const fileHierarchy = "/data/genres_hierarchy_unique.json"
const fileFeatures  = "/data/song_features.csv"



const start_get_data = performance.now();
Promise.all([
    d3.csv(fileTopList),
    d3.json(fileHierarchy),
    d3.csv(fileFeatures)
]).then(function(data) {
    const start_process_data = performance.now();
    console.log(`Getting files took ${Math.trunc(
        start_process_data-start_get_data)} ms`);

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

    // let sorted_arr = data[2].slice().sort(); // You can define the comparing function here.
    // // JS by default uses a crappy string compare.
    // // (we use slice to clone the array so the
    // // original array won't be modified)
    // let results = [];
    // for (let i = 0; i < sorted_arr.length - 1; i++) {
    //     if (sorted_arr[i + 1] == sorted_arr[i]) {
    //       results.push(sorted_arr[i]);
    //     }
    // }
    // return results;

    // Get the song ids
    const songIds = new Set(data[0].map(item => item.songid));

    // For the rankings: group them by week
    // https://stackoverflow.com/a/34890276/7857013
    const rankingsDict = data[0].reduce(function(result, x) {
        const y = { "song": songFeatures[x.songid], "week_pos": x.week_position};
        (result[x.weekid] = result[x.weekid] || []).push(y);
        return result;
    }, {});
    var rankingsList = Object.keys(rankingsDict);
    rankingsList.sort();
    rankingsList = rankingsList.map(key => {
        const top100 = rankingsDict[key];
        top100.week = key;
        return top100;
    });

    const start_show_stuff = performance.now();
    console.log(`Processing it took ${Math.trunc(
        start_show_stuff-start_process_data)} ms`);

    // todo Create a hierarchy genre lookup tree
    console.log(songFeatures["The Sound Of SilenceDisturbed"]);
    console.log(rankingsList.slice(0, 5));
}).catch(function(err) {
    console.log(err);
})
