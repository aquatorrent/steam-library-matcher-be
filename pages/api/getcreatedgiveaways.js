export default function GetCreatedGiveaways(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

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
      })  
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
        for (const t of temp.results) {
            // TODO: scrapping appid
            // a = document.querySelectorAll(".game_description_column .tablet_list_item");

            // for (let x of a) {
            //     console.log(x.getAttribute('data-ds-appid'));
            //     }
            let r = {
                name: t.name,
                app_id: t.app_id,
                package_id: t.package_id,
                link: t.link,
                end_timestamp: t.end_timestamp,
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
            modifiedRes.results.push(r);
        }
        res.status(200).json(modifiedRes);
    }).catch(function(err) {
        res.status(200).json({error: err, url:url});
    })
  }