export default function GetPlayerAchievementTotal(req, res) {
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
    let appids = "";
    if(req.query.appids) {
      appids = req.query.appids.replace(/[^0-9,]/g, '');
    }
    appids = appids.split(",");

    if (key === "" || steamid === "" || appids == "" || appids.length <= 0) {
        res.status(200).json({error: "invalid input"});
        return;
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
      })  
    });
    
    // Resolve all the promises
    Promise.all(requests)
    .then((results) => {
        let modifiedRes = [];
        for (let j=0; j < urls.length; j++) {
            let temp = {
                appid: appids[j],
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
    })
  }