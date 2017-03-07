#moon-master

##Installing

Make sure you have an up to date `config.js`

###Install mongodb

Run mongod.exe and then mongo.exe

In the mongo shell 

`use mmdb`

`db.test.insert({"test":"test"})`

Exit the mongo shell but leave mongod.exe running while using the node.js/express.js server

Finally run `node tools/initDb.js`

###Install nodejs dependencies

`npm install`

`npm install -g nodemon`

##Running

`nodemon index.js`

##Testing

`npm test`
