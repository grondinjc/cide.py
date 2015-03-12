// 
CHANGE_RM_TYPE = -1;
CHANGE_ADD_TYPE = 1; 

// used for /ide/save
function createModifGroup(changes, file, vers) { return { file: file, vers: vers, changes: changes}; }

function createAddModif(content, pos) { return { content: content, pos: pos, type: CHANGE_ADD_TYPE}; }
function createRemoveModif(count, pos) { return { count: count, pos: pos, type: CHANGE_RM_TYPE}; }

// used for /ide/open

function createOpen(filename) { return { file: filename}; }
// used for /ide/dump
function createDump(filename) { return { filename: filename}; }

// used for /chat/send
function createChatMessage(msg) { return { message: msg}; }
