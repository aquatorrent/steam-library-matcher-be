export default function GetCreatedGiveaways(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://aquatorrent.github.io');
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    let name =req.query.name;
    let appid = "";
    if (req.query.appid){
        appid=req.query.appid.replace(/[^0-9]/g,'');
    }
    
    if (name === "") {
      res.status(200).json({error: "invalid input"});
      return;
    }

    let body = {
        searchType:"games",
        searchTerms: name.split(" "),
        searchPage:1,
        size:20,
        searchOptions:{
            games:{
                userId:0,
                platform:"",
                sortCategory:"popular",
                rangeCategory:"main",
                rangeTime:{min:null,max:null},
                gameplay:{
                    perspective:"",
                    flow:"",
                    genre:""
                },
                rangeYear:{min:"",max:""},
                modifier:""
            },
            users:{sortCategory:"postcount"},
            lists:{sortCategory:"follows"},
            filter:"",
            sort:0,
            randomizer:0
        }
    };
     
    let url = "https://www.howlongtobeat.com/api/search";
    fetch(url, {
        method:"POST",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json",
            "Referer": "https://www.howlongtobeat.com"
        }
    }).then(response=> {
        return response.json();
    }).then(data => {
        if (!data.data){
            res.status(200).json({});
            return;
        }
        for (let e of data.data) {
            if (!appid || appid == "" || appid === "" || e.profile_steam == appid) {
                res.status(200).json({
                    appid: e.profile_steam,
                    main: e.comp_main,
                    plus: e.comp_plus,
                    comp: e.comp_100
                });
                return;
            }
        }
        res.status(200).json({});
    })
    .catch(function(err) {
        res.status(200).json({error: err, url:url});
    });
  }
  