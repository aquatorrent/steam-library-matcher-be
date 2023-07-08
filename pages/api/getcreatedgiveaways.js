export default function GetCreatedGiveaways(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const fetchBundle = (package_id) => {
        let url = "https://store.steampowered.com/api/packagedetails?packageids="+package_id;
        return fetch(url).then(function(response) {
            return response.json();
        }).catch(function(err) {
            res.status(200).json({error: err, url:url});
        });
    };

    let page ="";
    if (req.query.page) {
        page = req.query.page.replace(/[^0-9,]/g,'');
    }
    let username = "";
    if (req.query.username){
        username=req.query.username.replace(/[^A-Za-z0-9]/g,'');
    }
    
    if (page === "" || username === "") {
      res.status(200).json({error: "invalid input"});
      return;
    }

    let url = "https://www.steamgifts.com/user/"+username+"?format=json&include_winners=1&page="+page;
    let urls = [url];
    
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
        if (!results[0]) {
            res.status(200).json({error: "empty result from server", url:url});
        }
        let temp = results[0];
        let modifiedRes = {
            success: temp.success,
            page: temp.page,
            results: []
        };
        
        let promise = [];
        let pkgIDs = [];
        for (const t of temp.results) {
            if (t.package_id) {
                promise.push(fetchBundle(t.package_id));
                pkgIDs.push(t.package_id);
            }
        }

        Promise.all(promise)
        .then(results => {
            let bundle = new Map();
            if (pkgIDs.length > 0) {
                for (const r of pkgIDs) {
                    for (const a of results[0][r].data.apps) {
                        let temp = {
                            id: a.id,
                            name: a.name,
                        }
                        if (bundle.has(r)) {
                            bundle.get(r).push(temp);
                        } else {
                            bundle.set(r, [temp]);
                        }
                    }
                }
            }

            for (const t of temp.results) {
                let r = {
                    name: t.name,
                    app_id: t.app_id,
                    package_id: t.package_id,
                    link: t.link,
                    end_timestamp: t.end_timestamp,
                    group: t.group,
                    winners: []
                };
                for (const win of t.winners) {
                    if (win.received === true) {
                        r.winners.push({
                            steam_id: win.steam_id,
                            username: win.username
                        });
                    }
                }
                if (t.package_id) {
                    for (const b of bundle.get(t.package_id)) {
                        modifiedRes.results.push({
                            name: b.name,
                            package_name: r.name,
                            app_id: b.id,
                            package_id: r.package_id,
                            link: r.link,
                            end_timestamp: r.end_timestamp,
                            group: r.group,
                            winners: r.winners
                        });
                    }
                } else {
                    modifiedRes.results.push(r);
                }
            }
            res.status(200).json(modifiedRes);
        })
        .catch(function(err) {
            res.status(200).json({error: err, url:url});
        });
    }).catch(function(err) {
        res.status(200).json({error: err, url:url});
    });
  }