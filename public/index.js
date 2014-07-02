function Client(){
	
	this.templates = {
		files: _.template('<li><%= name %></li>'),
		folders: _.template('<li><a href="#" class="folder-list"><%= name %></a></li>'),
		errors: _.template('<li><strong><%= error %></strong></li>')
	};
	
	var self = this;
	
	
	this.display = function(data){
		$('#files').empty();
		
		_.each(data, function(file){
			if(file.type === 'file'){
				$(self.templates.files({
					name: file.name
				})).appendTo($('#files'));
			} else if(file.type === 'folder'){
				$(self.templates.folders({
					name: file.name
				})).data('folderName', file.name).appendTo($('#files'));
			} else if(file.type === 'error'){
				$(self.templates.errors({
					error: file.error
				})).appendTo($('#files'));
			}
		});
		$('#files .folder-list').on('click', function(){
			self.getFiles($(this).parents('li').data('folderName'));
		});
	};
	
	this.getFiles = function(dir){
		dir = dir || null;
		$.get('/list', {dir: dir}).done(_.bind(this.display, this)).fail(_.bind(console.log, console));
	};
	
	this.init = function(){
		this.getFiles();
		return this;
	};
}