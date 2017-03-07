#moon-master

##Installing

Make sure you have an up to date `config.js`

###Install MongoDB

Download and install MongoDB

`mkdir C:data/db`

Run C:/Program Files/MongoDB/Server/3.4/bin/mongod.exe and then C:/Program Files/MongoDB/Server/3.4/bin/mongo.exe

In the mongo.exe shell 

`use mmdb`

`db.test.insert({"test":"test"})`

Exit the mongo shell but leave mongod.exe running while using the node.js/express.js server

Finally run `npm run init-db && npm run create-map`

###Install nodejs dependencies

`npm install`

`npm install -g nodemon`

##Running

Ensure that mongod.exe is running first.

`nodemon index.js`

##Testing

`npm test`

##Cleaning MongoDB

`npm run clean-db && npm run create-map`

Make sure you are in the correct db with `db` then check that collections are correct in mongo.exe with `show collections` which should return players, rooms, and test.

Check that the collections are empty with `db.players.find({})` and `db.rooms.find({})`