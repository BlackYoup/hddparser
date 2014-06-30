var fs = require('fs'),
	path = require('path'),
	os = require('os'),
	Promise = require('pacta'),
	_ = require('underscore');
	
function Parser(){
	var self = this;
	
	this.readDir = function(dir){
		if(!dir){
			dir = this.defineRoot();
		}

		this.getDirFiles(dir).chainError(function(){
			console.log('Couldn\'t read directory ' + dir);
		}).chain(function(files){
			return self.parseFiles(files, dir);
		}).chain(function(allFilesStats){
			return _.reduce(allFilesStats, function(p, fileInfos){
				return p.append(fileInfos);
			}, Promise.of([]));
		}).map(function(arrFileInfos){
			_.each(arrFileInfos, function(fileInfos){
				if(fileInfos.err){
					console.log('Can\'t read ' + path.join(fileInfos.dir, fileInfos.file) + '. Error ' + fileInfos.error);
				} else if(fileInfos.fileStats.isDirectory()){
					self.readDir(path.join(fileInfos.dir, fileInfos.file));
				} else{
					console.log(path.join(fileInfos.dir, fileInfos.file));
				}
			});
		})
	};

	this.getDirFiles = function(dir){
		var promise = new Promise();
		fs.readdir(dir, function(err, files){
			if(err) promise.reject(err);
			else promise.resolve(files);
		});
		return promise;
	};

	this.parseFiles = function(files, dir){
		var arr = _.map(files, function(file){
			return self.getFileStats(path.join(dir, file)).map(function(fileStats){
				return {err: false, file: file, fileStats: fileStats, dir: dir};
			}).chainError(function(error){
				return Promise.of({err: true, file: file, dir: dir, error: error});
			});
		});
		return Promise.of(arr);
	};

	this.getFileStats = function(filePath){
		var promise = new Promise();
		fs.lstat(filePath, function(err, objStats){
			if(err) promise.reject(err);
			else promise.resolve(objStats);
		});
		return promise;
	};

	this.defineRoot = function(){
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
	};
	
	this.init = function(){
		this.readDir();
	};
}

module.exports = new Parser();