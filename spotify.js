const getFromApi = function(endpoint, query) {
    let url = 'https://api.spotify.com/v1/' + endpoint;

    let queryString = Qs.stringify(query);
    if (queryString) {
        url += '?' + queryString;
    };
    // console.log(url);
    return fetch(url).then(function(response) {
        if (response.status < 200 || response.status >= 300) {
            return Promise.reject(response.statusText);
        }
        return response.json();
    });
};


let artist;

const getArtist = function(name) {
    let endpoint = "search";
    let query = {
        q: name,
        limit: 1,
        type: 'artist'
    };
    return getFromApi(endpoint, query).then(function(item) {
        artist = item.artists.items[0]
        return artist;
    }).then(function(item) {
        let id = item.id;
        return (getRelatedArtists(id));
    }).then(function (item) {
        let relatedArtists = item.related;
        let fetchArray = [];

        // [function () {fetch('url1')}, function () {fetch('url1')},....]

        relatedArtists.forEach(function (related) {
            let id = related.id;
            let endpoint = `artists/${id}/top-tracks`;
            let query = {
                country: "US"
            };
            fetchArray.push(getFromApi(endpoint, query));
        });

        let promiseAll = Promise.all(fetchArray);
        return promiseAll;

    }).then(function(tracks){
        tracks.forEach(function(relatedTracks, index) {
            artist.related[index].tracks = relatedTracks.tracks;
            });
        console.log(artist);
        return artist;
    }).catch(function(err) {
        throw Error(err);
    });
}

const getRelatedArtists = function(id) {
    let endpoint = `artists/${id}/related-artists/`;
    let query = {
        
            };
    return getFromApi(endpoint, query).then(function(item) {
        // console.log(arguments);
        artist.related = item.artists;
        return artist;
    });
}

