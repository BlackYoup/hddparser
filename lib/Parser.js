var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    Promise = require('pacta'),
    _ = require('underscore');
    
function Parser(){
    var self = this;
  var myOS = null;
    
    this.currentDir = null;
    this.possibleDirs = null;
    
    this.readDir = function(dir, type){
        if(!dir){
            if(!this.currentDir){
                this.currentDir = myOS.getRoot();
            } else{
        dir = this.currentDir; // allows to skip the check for possible folders etc..
      }
        }
        
        if(type !== 'device' && this.currentDir !== dir){
            if(this.possibleDirs && !_.contains(this.possibleDirs, dir)){
                var p = new Promise();
                p.reject({error: 'wrong_folder_name'});
                return p;
            }
            this.currentDir = path.join(this.currentDir || '', dir);
        } else if(type === 'device'){
      this.currentDir = myOS.inDevices(dir);
    }
    
    this.currentDir = myOS.checkPath(this.currentDir); 
        
        return this.getDirFiles(this.currentDir).mapError(function(){
            return {error: 'unreadable'};
        }).chain(function(files){
            return self.parseFiles(files, self.currentDir);
        }).chain(function(allFilesStats){

      if(myOS.isRoot(self.currentDir)){
         allFilesStats.push(myOS.getDevices());
      }

            return _.reduce(allFilesStats, function(p, fileInfos){
                return p.concat(fileInfos);
            }, Promise.of([]));
        }).chain(function(arrFileInfos){
            var ret = _.map(arrFileInfos, function(fileInfos){
                if(fileInfos.err){
                    return {
                        type: 'error',
                        error: 'Can\'t get file name'
                    };
                } else if(fileInfos.type === 'device'){
          return {
            type: 'device',
            name: fileInfos.name
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
        if(!myOS.isRoot(self.currentDir)){
          files = _.union(['..'], files);
        }
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

    this.defineOS = function(){
        var ret = null;
        switch(os.type()){
            case 'Linux':
                return require('./linux');
            break;
            case 'Windows_NT':
                return require('./windows');
            break;
            default:
                throw 'Can\'t define your Operating System.';
            break;
        }
        return ret;
    };

  this.init = function(){
    myOS = this.defineOS();
  };
}

module.exports = new Parser();
