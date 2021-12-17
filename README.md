# Music-Chart-Visualization
Visualization of music charts using the d3 framework

# Data files

The main data sources are `Spotify charts` and `Billboard.com`. The data we used
and sources for them are described more in detail below.

`song_features.csv` contains information about songs like danceability and speechiness.
`song_ranking.csv` constains songs with some data and their ranking every week.
Since this file is on the bigger side and a lot of data is duplicate, the file size was
reduced by removing columns using our data processing script into `song_ranking_small.csv`. The original rankings rankings and features originate from:
https://data.world/kcmillersean/billboard-hot-100-1958-2017

`genres_spotify.json` contains objects with a hierarchy of genres. This file has been
slightly changed from the original. The original was found at:
https://github.com/voltraco/genres/blob/master/categorized-subset.json

`song_data_bb.json` and the data files in the `duplicate words` folder contain information about the top 100 songs of each year. Specifically it contains things
like amount of duplicate phases and the lyrics of a song, which we processes to get
the yearly words used. This data was found at: https://github.com/kevinschaich/billboard

Found interesting but unused datasets:
https://www.kaggle.com/nadintamer/what-makes-top-spotify-songs-popular/data
https://www.kaggle.com/leonardopena/top-spotify-songs-from-20102019-by-year/code
