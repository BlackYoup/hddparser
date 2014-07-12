var execFile = require('child_process').execFile,
    Promise = require('pacta'),
    _ = require('underscore'),
    path = require('path');

function Windows(){
  var root = '\\';

  this.getDevices = function(){
    var p = new Promise();
    var child = execFile(path.join(__dirname, '..', 'bin', 'list_disks.exe'), function(err, stdout, stdin){
      if(err) p.resolve([]);
      else {
        try{
          var devices = _.map(JSON.parse(stdout), function(device){
            var name = null;
            if(device.name){
              name = device.name + ' (' + device.path + ')';
            } else{
              name = device.path + '\\';
            }
            return {
              type: 'device',
              name: name
            };
          });
          p.resolve(devices);
        } catch(e){
          p.resolve([]);
        }
      }
    });
    return p;
  };

  this.getRoot = function(){
    return root;
  };

  this.inDevices = function(askedDevice){
    var deviceName = null,
        askedDevice = askedDevice.trim(),
        delStart = askedDevice.lastIndexOf('('),
        delStop = askedDevice.lastIndexOf(')');

    if(delStart && delStop && delStart < delStop){
      deviceName = askedDevice.substring(delStart + 1, delStop).trim();
    } else if(askedDevice.length === 3){
      deviceName = askedDevice.substr(0, 2);
    } else{
      deviceName = root;
    }
    return path.join(deviceName);
  };

  this.isRoot = function(currentDir){
    if(currentDir === root || currentDir.length === 3 && currentDir.substr(0, 2).match(/[a-zA-Z]\:/)){
      return true;
    } else{
      return false;
    }
  };

  this.checkPath = function(path){
    return path;
  };
}

module.exports = new Windows();