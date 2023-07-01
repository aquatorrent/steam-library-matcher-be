export default function GetOwnedGames(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    let steamid = "";
    if(req.query.steamid) {
      steamid= req.query.steamid.replace(/\D/g,'');
    }
    let key = "";
    if(req.query.key) {
      key= req.query.key.replace(/[^A-Za-z0-9]/g,'');
    }

    if (key === "" || steamid === "") {
      res.status(200).json({error: "invalid input"});
      return;
    }

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
        let temp = results[0].response.players;
        let modifiedRes = [];
        for (const p of temp) {
          modifiedRes.push({
            steamid: p.steamid,
            personaname: p.personaname,
            avatarmedium: p.avatarmedium
          });
        }
        res.status(200).json(modifiedRes);
    }).catch(function(err) {
      res.status(200).json({error: "err", url:url});
    })
  }