/* Class to encapsulate tree view representation 
of the project */
function ProjectTreeView() {
  this._ID_PREFIX = "tree-node";

  this.initRoot = function(treeID){
    $("#" + treeID + ">ul>li>span").on("click", this._dirClick);
  };

  this.addNode = function(nodepath, isDir) {
    nodepath = this._setAbsolute(nodepath).trim();
    var parts = nodepath.split("/");
    var parentDir = parts.slice(0, -1).join("/") + "/";
    // Size-1 contains the name
    if(isDir){
      this._addDir(parts[parts.length-1] + "/" , parentDir);
    }
    else{
      this._addFile(parts[parts.length-1], parentDir);
    }
  };

  this.removeNode = function(nodepath){
    nodepath = this._setAbsolute(nodepath).trim();
    if(nodepath == "/"){
      console.log("TRYING TO REMOVE ROOT FOLDER .... BAD ...");
      alert("TRYING TO REMOVE ROOT FOLDER .... BAD ...");
      return;
    }

    if(this._isDir(nodepath)) {
      // Remove element and children
      this._getDirNode(this._ID_PREFIX+nodepath).parent().remove();
    }
    else { // File
      this._getFileNode(this._ID_PREFIX+nodepath).remove();
    }
  };

  this._isDir = function(path) {
    return path.endsWith("/");
  };

  this._getFileNode = function(id) {
    // Workaround to allow slashes in selector
    return $("li[id='" + id + "']");
  };

  this._getDirNode = function(id) {
    // Workaround to allow slashes in selector
    return $("ul[id='" + id + "']");
  };

  this._setAbsolute = function(path){
    return path.startsWith("/") ? path : "/" + path;
  };

  this._addDir = function(dirname, parentDir){
    var parentId = this._ID_PREFIX + parentDir;
    var nodeId = parentId + dirname;

    if(this._getDirNode(nodeId).length != 0){
      alert("Node already exists : " + (parentDir + dirname));
      return;
    }

    this._getDirNode(parentId).append(
      $('<li>').attr("class", "parent_li")
               .append(
        $('<span>').attr("class", "tree-node-dir glyphicon glyphicon-folder-open")
                   .on("click", this._dirClick).append(
          $('<span>').attr("class", "tree-node-name").append(
            dirname
          )
        )
      ).append(
        $('<ul>').attr("id", nodeId)
      )
    );
  };

  this._addFile = function(filename, parentDir) {
    var parentId = this._ID_PREFIX + parentDir;
    var nodeId = parentId + filename;

    if(this._getFileNode(nodeId).length != 0){
      alert("Node already exists : " + (parentDir + filename));
      return;
    }

    this._getDirNode(parentId).append(
      $('<li>').attr("class", "parent_li")
               .attr("id", nodeId)
               .append(
        $('<span>').attr("class", "tree-node-file glyphicon glyphicon-file")
                   .attr("title", parentDir+filename)
                   .on("click", this._fileClick).append(
          $('<span>').attr("class", "tree-node-name").append(
            filename
          )
        )
      )
    );
  };


  this._fileClick = function(e) {
    // 'this' is now the treeview node element
    alert("TODO: Switch to file " + this.title);
    //ideApplication.showFileContent(this.title);
    e.stopPropagation();
  };

  this._dirClick = function(e) {
    // 'this' is now the treeview node element
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    if (children.is(":visible")) {
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
    } else {
        children.show('fast');
        $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
    }
    e.stopPropagation();
  };
}
