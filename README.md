# Steam Library Matcher! BE
Backend code that acts as a proxy for [Steam Library Matcher!](https://github.com/aquatorrent/steam-library-matcher)

[Give me a try](https://aquatorrent.github.io/steam-library-matcher/)

## Table of Contents:

- [Getting Started](#getting-started)
- [Endpoint Lists](#endpoint-lists)
  - [[GET] /api/getownedgames](#get-api-getownedgames)
  - [[GET] /api/getplayersummaries](#get-api-getplayersummaries)

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Endpoint Lists

## [GET] /api/getownedgames
Acts as a proxy to [https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001](https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29) with `format=json` and `include_appinfo=true` param.

Arguments:
- key
- steamid
- [OPTIONAL] include_appinfo : include name to response, default to false
- [OPTIONAL] appids : filter by appids, separated by comma

For more info on the arguments, check the [Steam API documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29) page.

## [GET] /api/getplayersummaries
Acts as a proxy to [https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/](https://partner.steamgames.com/doc/webapi/ISteamUser) with `format=json` param.

Arguments:
- key
- steamid

For more info on the arguments, check the [Steam API documentation](https://partner.steamgames.com/doc/webapi/ISteamUser) page.

## [GET] /api/getplayerachievementtotal
Hits [http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/](https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerAchievements_.28v0001.29) and count all total and obtained achievements.

Arguments:
- key
- steamid
- appids : appids, separated by comma

For more info on the arguments, check the [Steam API documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerAchievements_.28v0001.29) page.

## [GET] /api/getcreatedgiveaways
Acts as a proxy to https://www.steamgifts.com/user/<username>?format=json&include_winners=1&page=<page>.

Arguments:
- username : steamgifts username
- page

For more info on the arguments, check the [Steamgifts API documentation](https://www.steamgifts.com/discussion/XFaPQ/json-support) page.

## [GET] /api/gethltbtime
Acts as a proxy to https://howlongtobeat.com/api/search. It will search by name first and then make sure that the game name is correct by comparing it with the appid.

Arguments:
- name : game name
- appid
