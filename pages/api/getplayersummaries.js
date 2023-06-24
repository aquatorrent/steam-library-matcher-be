export default function GetOwnedGames(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    let steamid = req.query.steamid.replace(/[^0-9,]/g,'');
    let key = req.query.key.replace(/[^A-Za-z0-9]/g,'');

    let url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key="+key+"&format=json&steamids="+steamid;
    let urls = [url];
    
    var requests = urls.map(function(url){
      return fetch(url)
      .then(function(response) {
        return response.json();
      })  
    });
    
    // Resolve all the promises
    Promise.all(requests)
    .then((results) => {
        if (!results[0]) {
            res.status(200).json({error: "empty result from server", url:url});
        }
        res.status(200).json(results[0]);
    }).catch(function(err) {
      res.status(200).json({error: "err", url:url});
    })
  }