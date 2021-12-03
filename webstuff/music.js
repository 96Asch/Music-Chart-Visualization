// for "Unexpected token ]" search for regex ",\n *]" in json
const json_song_data_bb = "/data/song_data_bb.json"

// Utilities:
var last_seg = ["", -1];
function start(seg_name) {
    const start_time = performance.now();
    if (last_seg[1] != -1) {
        const time = Math.trunc(start_time - last_seg[1]);
        console.log(`${last_seg[0]} took ${time} ms`);
    };
    last_seg = [seg_name, start_time];
};
function tryOrGet(func, otherwise) {
    try {
        return func();
    } catch(error) {
        return otherwise;
    }
}

// Get the features as a map (songId) -> features.
const song_features = "/data/song_features.csv"
function promise_song_features_dict() {
    return d3.csv(song_features).then(function(data) {
        const songFeatures = { };
        for (var i = 0; i < data.length; i++) {
            // We NEED json5 to handle the quotes that are used.
            const genres = tryOrGet(() => JSON5.parse(
                data[i].spotify_genre), []);
            songFeatures[data[i].songid] = {
                "popularity": data[i].spotify_track_popularity,
                "track": data[i].spotify_track_id,
                "genres": genres,
                "artist": data[i].performer,
                "title": data[i].song
            };
        };
        return songFeatures;
    });
}

// Get the song rankings as a list by week.
const song_rankings = "/data/song_ranking_small.csv";
function promise_song_rankings_list() {
    return d3.csv(song_rankings).then(function(data) {
        // First group all entries by week, into a dictionary.
        // https://stackoverflow.com/a/34890276/7857013
        const rankingsDict = data.reduce(function(result, x) {
            x.week_position = parseInt(x.week_position, 10);
            (result[x.weekid] = result[x.weekid] || []).push(x);
            return result;
        }, {});
        // Then create a list from that, sorted by week.
        const weekList = Object.keys(rankingsDict);
        weekList.sort();
        const rankingsList = weekList.map(key => {
            rankingsDict[key].sort((a, b) => (a.week_position
                > b.week_position ? 1 : -1));
            return {
                "songs": rankingsDict[key],
                "week": key
            }
        });
        return rankingsList;
    });
}

// Get the song rankings, and add features to each song.
function promise_song_rankings_list_with_features() {
    return Promise.all([
        promise_song_features_dict(),
        promise_song_rankings_list()
    ]).then(function([features, rankings]) {
        var total = kept = 0;
        rankings.forEach((week) => {
            total += week.songs.length;
            week.songs = week.songs.filter((item) => {
                let songid = item.song + item.performer;
                if (!(songid in features)) return false;
                item.features = features[songid];
                return true;
            });
            kept += week.songs.length;
        });
        const lost = Math.round(((total - kept) / total) * 10000) / 100;
        console.log(`Discarded ${lost}% of rankings due to no features.`);
        return rankings;
    });
}

// Get the genres, and include a 'top_genre_of' function.
const spotify_genres = "/data/genres_spotify.json"
function promise_genre_lookups() {
    return d3.json(spotify_genres).then(function(data) {
        data.forEach(function (go) {
            go.genre = go.genre.toLowerCase();
            go.subgenre = new Set(go.subgenre.map(s => s.toLowerCase()));
        });
        data.top_genre_of_base = function(name) {
            for (const go of data) {
                if (go.subgenre.has(name)) return go.genre;
            }
            for (const go of data) {
                if (go.genre == name) return go.genre;
            }
            return undefined;
        };
        data.top_genre_of = function(name) {
            const getName = data.top_genre_of_base(name);
            if (getName !== undefined) return getName;
            var splitOn = name.indexOf(' ');
            while (splitOn >= 0) {
                const res1 = data.top_genre_of_base(name.substring(0, splitOn + 1));
                if (res1 !== undefined) return res1;
                const res2 = data.top_genre_of_base(name.substring(splitOn + 1));
                if (res2 !== undefined) return res2;
                splitOn = name.indexOf(' ', splitOn + 1);
            }
            return name;
        };
        return data;
    });
}

// Get a list of times. Each entry has genre popularities.
function promise_genre_popularity() {
    return Promise.all([
        promise_genre_lookups(),
        promise_song_rankings_list_with_features()
    ]).then(function([genres, rankings]) {

        // First remove any songs without genres.
        var total_songs = song_with_any = 0;
        rankings.forEach(function(weekdata) {
            const withGenres = weekdata.songs.filter(
                s => s.features.genres.length > 0);
            total_songs += weekdata.songs.length;
            song_with_any += withGenres.length;
            weekdata.songs = withGenres;
        });
        const nogenres = Math.round(((total_songs -
            song_with_any) / total_songs) * 10000) / 100;
        console.log(`Discarded ${nogenres}% of songs due to not having a genre.`);

        // Then get the "top" genre of all the songs, and set popularity.
        var notfoundmap = {};
        var without_genre = 0;
        rankings.forEach(function(weekdata) {
            const base = genres.reduce((res, go) => {
                res[go.genre] = 0;
                return res;
            }, {});
            for (song of weekdata.songs) {
                const song_genres = song.features.genres
                    .map((g) => genres.top_genre_of(g))
                    .filter((v) => {
                        const found = v in base;
                        if (!found) notfoundmap[v] = (notfoundmap[v] || 0) + 1;
                        return found;
                    });
                if (song_genres.length == 0) {
                    without_genre += 1;
                    continue;
                }
                const strength = 10 / (song.week_position * 0.2);
                const perg = strength / song_genres.length;
                for (g of song_genres) {
                    base[g] += perg;
                }
            }
            weekdata.popularity = base;
        });
        const notFound = Math.round((without_genre / song_with_any) * 10000) / 100;
        console.log(`Discarded ${notFound}% of songs had 0 found genres.`);
        return rankings;
    });
}


start("Getting data");
var songData = {};
promise_genre_popularity().then(function(data) {
    start("Show stuff");

    for (i = 0; i < data.length; i += 52) {
        console.log(data[i]);
    }

    songData = data.slice(0, 20);
    // todo Create a hierarchy genre lookup tree
    // console.log(songFeatures["The Sound Of SilenceDisturbed"]);
    // console.log(rankingsList.slice(0, 5));
}).catch(function(err) {
    console.log(err);
})
