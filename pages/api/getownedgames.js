export default function GetOwnedGames(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const fetchGameInfo = (app_id) => {
      let url = "https://store.steampowered.com/api/appdetails?appids="+app_id;
      return fetch(url).then(function(response) {
          return response.json();
      }).catch(function(err) {
          return res.status(200).json({error: err, url:url});
      });
    };

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
    let dlcOnly = req.query.dlc_only;
    if (dlcOnly != "true") {
      dlcOnly = false;
    }

    let appidsArr = [];    
    if (appids) {
      appidsArr = appids.split(",");
    }
    let urlDLC = [];
    if (dlcOnly) {
      for(let appid of appidsArr) {
        urlDLC.push(fetchGameInfo(appid));
      }
    }
    
    Promise.all(urlDLC)
    .then((results) => {
      let dlcMap = new Map();
      if (!dlcOnly) {
        return dlcMap;
      }

      let temp = [];
      results.forEach((v,k) => {
          let id = appidsArr[k];
          if (!v[id] || !v[id].success || v[id].data.type != "dlc" || !v[id].data.fullgame || !v[id].data.fullgame.appid) {
            return;
          }
          dlcMap.set(parseInt(v[id].data.fullgame.appid), parseInt(id));
          temp.push(v[id].data.fullgame.appid);
      });
      appidsArr = temp;
      appids = appidsArr.join();
      return dlcMap;
    }).then((dlcMap) => {
      let inputJSON = "";
      if (appids) {
        inputJSON = `{"steamid":`+steamid+`,"include_appinfo":`+includeAppInfo+`,"appids_filter":[`+appids+`]}`
        inputJSON = "&input_json=" + encodeURIComponent(inputJSON);
      } else {
        return res.status(200).json([]);
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
          return res.status(200).json({error: "empty result from server", url:url});
        } else if (results[0].response.game_count == 0) {
          return res.status(200).json([]);
        }
        
        let temp = results[0].response.games;
        for (let g of temp) {
          let appid = g.appid;
          if(dlcMap.has(appid) && dlcMap.get(appid)) {
            appid = dlcMap.get(appid);
          }
          modifiedRes.push({
            appid: appid,
            name: g.name,
            playtime: g.playtime_forever
          });
        }
        return res.status(200).json(modifiedRes);
      }).catch(function(err) {
        return res.status(200).json({error: err, url:url});
      });
    }).catch(function(err) {
      return res.status(200).json({error: err, url:urls});
    });
  }