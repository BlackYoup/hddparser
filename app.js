var fs = require('fs'),
	path = require('path');
function readDir(dir){
	if(!dir)
		dir = '/';
		
	var currentFiles = fs.readdirSync(dir);
	currentFiles.forEach(function(obj){
		var objStats = fs.lstatSync(path.join(dir, obj));
		if(objStats.isDirectory()){
			console.log('Entering in ' + dir);
			readDir(path.join(dir, obj));
			console.log('Leave ' + dir);
		}
		else
			console.log(path.join(dir, obj));
	});
}
readDir();