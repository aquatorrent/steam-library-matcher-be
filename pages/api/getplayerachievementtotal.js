export default function GetPlayerAchievementTotal(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const fetchGameInfo = (app_id) => {
      let url = "https://store.steampowered.com/api/appdetails?appids="+app_id;
      return fetch(url).then(function(response) {
          return response.json();
      }).catch(function(err) {
        res.status(200).json({error: err, url:url});
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
    let appids = "";
    if(req.query.appids) {
      appids = req.query.appids.replace(/[^0-9,]/g, '');
    }
    appids = appids.split(",");
    let dlcOnly = req.query.dlc_only;
    if (dlcOnly != "true") {
      dlcOnly = false;
    }

    if (key === "" || steamid === "" || appids == "" || appids.length <= 0) {
        res.status(200).json({error: "invalid input"});
        return;
    }
    let urlDLC = [];
    if (dlcOnly) {
      for(let appid of appids) {
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
          let id = appids[k];
          if (!v[id] || !v[id].success || v[id].data.type != "dlc" || !v[id].data.fullgame || !v[id].data.fullgame.appid) {
            return;
          }
          dlcMap.set(v[id].data.fullgame.appid, id);
          temp.push(v[id].data.fullgame.appid);
      });
      appids = temp;
      return dlcMap;
    }).then((dlcMap) => {
      if (appids.length <= 0) {
        res.status(200).json([]);
      }

      let urls = [];
      for(let appid of appids) {
          let url = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key="+key+"&steamid="+steamid+"&appid="+appid;
          urls.push(url);
      }
      
      var requests = urls.map(function(url){
        return fetch(url)
        .then(function(response) {
          return response.json();
        }).catch(function(err) {
          res.status(200).json({error: err, url:url});
        });
      });
      
      // Resolve all the promises
      Promise.all(requests)
      .then((results) => {
          let modifiedRes = [];
          for (let j=0; j < urls.length; j++) {
              let appid = appids[j];
              if(dlcMap.has(appid) && dlcMap.get(appid)) {
                appid = dlcMap.get(appid);
              }
              let temp = {
                  appid: appid,
                  ach: 0,
                  maxAch: 0
              };
              if (!results[j].playerstats || !results[j].playerstats.achievements) {
                  modifiedRes.push(temp);
                  continue;
              }
              for (let a of results[j].playerstats.achievements) {
                  temp.maxAch++;
                  if (a.achieved == 1) {
                      temp.ach++;
                  }
              }
              modifiedRes.push(temp);
          }
          res.status(200).json(modifiedRes);
      }).catch(function(err) {
        res.status(200).json({error: err, url:urls});
      });
    }).catch(function(err) {
        res.status(200).json({error: err, url:urls});
    });
  }