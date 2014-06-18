var fs = require('fs'), // fs is the module to read the FileSystem
	path = require('path'), // I'll use path to correctly join the files paths
	os = require('os'), // os will be used to get the system Operating System
	Promise = require('pacta'), // Promises to deal with async and chaining
	_ = require('underscore'); // underscore for functional stuff
	
function readDir(dir){
	if(!dir){
		dir = defineRoot(); // if dir isn't defined, we set a default value
	}
	
	// we first get all the dir's files
	getDirFiles(dir).chainError(function(){
		console.log('Couldn\'t read directory ' + dir);
	}).chain(function(files){
		return parseFiles(files, dir); // then, we parse the files
	}).chain(function(allFilesStats){ // we now have an array of promises containing the data [P1(data1), P2(data2))]
		return _.reduce(allFilesStats, function(p, fileInfos){ // so let's reduce this array to have a promise of data : P[data1, data2];
			return p.append(fileInfos);
		}, Promise.of([]));
	}).map(function(arrFileInfos){ // map the returned promise
		_.each(arrFileInfos, function(fileInfos){ // loop the returned value ([data1, data2])
			if(fileInfos.err){ // if we got an error during parsing
				console.log('Can\'t read ' + path.join(fileInfos.dir, fileInfos.file) + '. Error ' + fileInfos.error); // display the error
			} else if(fileInfos.fileStats.isDirectory()){ // if file is a directory
				readDir(path.join(fileInfos.dir, fileInfos.file)); // then call back the entier function with the new directory path
			} else{
				console.log(path.join(fileInfos.dir, fileInfos.file)); // else, just print the file's path
			}
		});
	})
}

function getDirFiles(dir){ // get the files in the directory
	var promise = new Promise(); // declare promise
	fs.readdir(dir, function(err, files){ // get the files
		if(err) promise.reject(err); // if an error occured, reject the promise
		else promise.resolve(files); // else, fullfill the promise with the value [files]
	});
	return promise; // return the promise
}

function parseFiles(files, dir){ // parse the directory
	var arr = _.map(files, function(file){ // map the array of files to get its stats
		return getFileStats(path.join(dir, file)).map(function(fileStats){ // map the returned promise to return good values
			return {err: false, file: file, fileStats: fileStats, dir: dir};
		}).chainError(function(error){ // chaine error the promise to give it a new state (fullfiled state with values)
			return Promise.of({err: true, file: file, dir: dir, error: error});
		});
	});
	return Promise.of(arr); // return the array we just made [P1(data, P2(data))]
}

function getFileStats(filePath){ // just get the file stats
	var promise = new Promise(); // declare promise
	fs.lstat(filePath, function(err, objStats){ // get the stats
		if(err) promise.reject(err); // if an error occured, reject the promise
		else promise.resolve(objStats); // else, fullfill it
	});
	return promise; // return the promise
}

function defineRoot(){ // try to define the root of your Hard drive
	var ret = null;
	switch(os.type()){
		case 'Linux':
			ret = '/';
		break;
		case 'Windows_NT':
			ret = 'C:\\';
		break;
		default:
			throw 'Can\'t define your Operating System.';
		break;
	}
	return ret;
}

readDir(); // we launch the main function