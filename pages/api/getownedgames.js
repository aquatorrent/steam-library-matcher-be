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

    let appids;
    if(req.query.appids) {
      appids = req.query.appids.replace(/[^0-9,]/g, '');
    }
    let includeAppInfo = req.query.include_appinfo ;
    if (includeAppInfo != "true") {
      includeAppInfo = false;
    }

    let inputJSON = "";
    if (appids) {
      inputJSON = `{"steamid":`+steamid+`,"include_appinfo":`+includeAppInfo+`,"appids_filter":[`+appids+`]}`
      inputJSON = "&input_json=" + encodeURIComponent(inputJSON);
    }
    
    let url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+key+"&steamid="+steamid+"&format=json&include_appinfo="+includeAppInfo+inputJSON;
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
      let modifiedRes = [];
      if (!results[0]) {
        res.status(200).json({error: "empty result from server", url:url});
      } else if (results[0].response.game_count == 0) {
        res.status(200).json([]);
        return;
      }
      
      let temp = results[0].response.games;
      for (let g of temp) {
        modifiedRes.push({
          appid: g.appid,
          name: g.name,
          playtime: g.playtime_forever
        });
      }
      res.status(200).json(modifiedRes);
    }).catch(function(err) {
      res.status(200).json({error: err, url:url});
    })
  }