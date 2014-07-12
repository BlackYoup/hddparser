var express = require('express'),
    app = express(),
    Parser = require('./lib/Parser.js'),
    path = require('path'),
    open = require('open');

Parser.init();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/list', function(req, res){
    Parser.readDir(req.query.dir, req.query.type).map(function(data){
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

app.listen(3000, function(){
    console.log('Your browser should be opened at "http://127.0.0.1:3000". If not, copy the given URL and paste it on your brower\'s bar');
    open('http://127.0.0.1:3000');
});
