function Client(){
    
    this.templates = {
        files: _.template('<li><%= name %></li>'),
        folders: _.template('<li><a href="#" class="folder"><%= name %></a></li>'),
        errors: _.template('<li><strong><%= error %></strong></li>'),
      devices: _.template('<li><a href="#" class="device"><%= name %></a></li>')
  };
    
    var self = this;
    
    
    this.display = function(data){
        $('#files-list, #devices-list').empty();
        
        _.each(data, function(file){
            if(file.type === 'file'){
                $(self.templates.files({
                    name: file.name
                })).appendTo($('#files-list'));
            } else if(file.type === 'folder'){
                $(self.templates.folders({
                    name: file.name
                })).data('folderName', file.name).appendTo($('#files-list'));
            } else if(file.type === 'device'){
        $(self.templates.devices({
          name: file.name
        })).data('device', file).appendTo($('#devices-list'));
      } else if(file.type === 'error'){
                $(self.templates.errors({
                    error: file.error
                })).appendTo($('#files-list'));
            }
        });
        $('#files-list .folder').on('click', function(){
            self.getFiles($(this).parents('li').data('folderName'), 'folder');
        });
    $('#devices-list .device').on('click', function(){
      self.getFiles($(this).parents('li').data('device').name, 'device');
    });

    if($('.device').length <= 0){
      $('#devices').hide();
    } else{
      $('#devices').show();
    }

    };
    
    this.getFiles = function(dir, type){
        dir = dir || null;
    type = type || null;
        $.get('/list', {dir: dir, type: type}).done(_.bind(this.display, this)).fail(_.bind(console.log, console));
    };
    
    this.init = function(){
        this.getFiles();
    return this;
    };
}
