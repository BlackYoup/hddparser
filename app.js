var express = require('express'),
	app = express(),
	Parser = require('./Parser.js'),
	path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/list', function(req, res){
	Parser.readDir(req.query.dir).map(function(data){
		if(data.error){
			res.send(400, data.error);
		} else{
			res.send(200, data);
		}
	}).mapError(function(err){
		console.log(err);
		res.send(500);
	});
});

app.listen(3000);