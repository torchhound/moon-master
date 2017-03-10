var express = require('express');

var router = express.Router();

//returns join.html if user navigates to '/'
router.get("/", function(req, res, next) {
	res.render("join.html");
});

//Returns join.html
router.get("/join", function(req, res, next) {
	res.render("join.html");
});

//Returns game.html
router.get("/game", function(req, res, next) {
	res.render("game.html");
});

module.exports = router;