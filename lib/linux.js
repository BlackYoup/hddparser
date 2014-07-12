var exec = require('child_process').exec,
        Promise = require('pacta'),
        _ = require('underscore'),
    path = require('path');

function Linux(){
    var self = this,
            mountPath = '/mnt/',
      root = '/',
      inDevice = false;

    this.getDevices = function(){
        var p = new Promise();
        var child = exec('mount | grep ' + mountPath, function(err, stdout, stdin){
            if(err) p.resolve([]);
            else p.resolve(self.parseDevicesSTDOUT(stdout));
        });
        return p;
    };

    this.parseDevicesSTDOUT = function(stdout){
        var allDevices = stdout.split('\n');
        allDevices = _.filter(allDevices, function(device){
            return device !== '';
        });

        return _.map(allDevices, function(device){
            if(device !== ''){
                var start = device.indexOf(mountPath) + mountPath.length,
                        stop = device.indexOf(' ', start);
                return {
          type: 'device',
          name: device.substr(start, (stop - start)) 
        };
            }
        });
    };

  this.inDevices = function(askedDevice){
    inDevice = true;
    return path.join(mountPath, askedDevice)
  };

  this.outDevices = function(){
    return path.join(root);
  };

  this.getRoot = function(){
    return root;
  };

  this.checkPath = function(path){
    if(path === mountPath.substr(0, mountPath.lastIndexOf('/')) && inDevice){
      inDevice = false;
      return this.outDevices();   
    } else{
      return path;
    }
  };

  this.isRoot = function(currentDir){
    return currentDir === root;
  };
}

module.exports = new Linux();
