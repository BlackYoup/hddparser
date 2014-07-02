var fs = require('fs'),
	path = require('path'),
	os = require('os'),
	Promise = require('pacta'),
	_ = require('underscore');
	
function Parser(){
	var self = this;
	
	this.currentDir = null;
	this.possibleDirs = null;
	
	this.readDir = function(dir){
		if(!dir){
			if(!this.currentDir){
				dir = this.defineRoot();
			} else{
				dir = this.currentDir;
			}
		}
		
		if(this.currentDir !== dir){
			if(this.possibleDirs && !_.contains(this.possibleDirs, dir)){
				var p = new Promise();
				p.resolve({error: 'Wrong folder name'});
				return p;
			}
			dir = path.join(this.currentDir || '', dir);
		}
		
		return this.getDirFiles(dir).mapError(function(){
			return {error: 'unreadable'};
		}).chain(function(files){
			self.currentDir = dir;
			return self.parseFiles(files, dir);
		}).chain(function(allFilesStats){
			return _.reduce(allFilesStats, function(p, fileInfos){
				return p.append(fileInfos);
			}, Promise.of([]));
		}).chain(function(arrFileInfos){
			var ret = _.map(arrFileInfos, function(fileInfos){
				if(fileInfos.err){
					return {
						type: 'error',
						error: 'Can\'t get file name'
					};
				} else if(fileInfos.fileStats.isDirectory()){
					return {
						type: 'folder',
						name: fileInfos.file
					};
				} else{
					return {
						type: 'file',
						name: fileInfos.file
					};
				}
			});
			
			self.possibleDirs = _.pluck(_.filter(ret, function(obj){
				return obj.type === 'folder';
			}), 'name');
			
			return Promise.of(ret);
		});
	};

	this.getDirFiles = function(dir){
		var promise = new Promise();
		fs.readdir(dir, function(err, files){
			if(err) {
				promise.reject(err);
			} else {
				files = _.union(['..'], files);
				promise.resolve(files);
			}
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
}

module.exports = new Parser();