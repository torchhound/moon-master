# moon-master

## Installing

Make sure you have an up to date `config.js`

### Install nodejs dependencies

`npm install`

`npm install -g nodemon`

## Running

`nodemon`

## Testing

`npm test`

## Troubleshooting

If examining a player returns 2 identical outputs or you notice a console.log of the map with 2 of the same player the map did not get recreated on server restart and the checks failed.

Run this from the root of the repo to recreate the map: `node -e 'require("./models/map").create()'`
