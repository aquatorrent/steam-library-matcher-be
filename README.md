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

For more info on the arguments, check the [Steam API documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29) page.

## [GET] /api/getplayersummaries
Acts as a proxy to [https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/](https://partner.steamgames.com/doc/webapi/ISteamUser) with `format=json` param.

Arguments:
- key
- steamids

For more info on the arguments, check the [Steam API documentation](https://partner.steamgames.com/doc/webapi/ISteamUser) page.