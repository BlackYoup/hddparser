var express = require('express'),
	app = express(),
	Parser = require('./Parser.js'),
	path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/list', function(req, res){
	Parser.readDir(req.query.dir).map(function(data){
		res.send(200, data);
	}).mapError(function(err){
		if(err.error === 'unreadable'){
			res.send(403, err.error);
		} else if(err.error === 'wrong_folder_name'){
			res.send(400, err.error);
		} else{
			res.send(500);
		}		
	});
});

app.listen(3000);