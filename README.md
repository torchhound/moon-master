#moon-master

##Installing

Make sure you have an up to date `config.js`

###Install mongodb

Download and install mongodb

`mkdir C:data/db`

Run C:/Program Files/MongoDB/Server/3.4/bin/mongod.exe and then C:/Program Files/MongoDB/Server/3.4/bin/mongo.exe

In the mongo.exe shell 

`use mmdb`

`db.test.insert({"test":"test"})`

Exit the mongo shell but leave mongod.exe running while using the node.js/express.js server

Finally run `node tools/initDb.js`

###Install nodejs dependencies

`npm install`

`npm install -g nodemon`

##Running

Ensure that mongod.exe is running first.

`nodemon index.js`

##Testing

`npm test`
