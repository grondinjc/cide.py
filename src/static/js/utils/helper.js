/* Encoder and decoder for html entities */
function htmlEncode(value) { return $('<div/>').text(value).html(); }
function htmlDecode(value) { return $('<div/>').html(value).text(); }

/* ARRAY HELPER */
Array.prototype.dcopy = function() {
  return $.extend(true, [], this);
};
Array.prototype.clear = function() {
  while (this.length) {
    this.pop();
  }
};

/* STRING HELPER */
String.prototype.insert = function(str, index) {
  index = Math.max(index, 0); // Check lower bound;
  return this.slice(0, index) + str + this.slice(index);
};
String.prototype.startsWith = function (str) {
  return this.indexOf(str) == 0;
};
String.prototype.endsWith = function(str) {
  var d = this.length - str.length;
  var ends = d >= 0 && this.lastIndexOf(str) === d;
  return d >= 0 && this.lastIndexOf(str) === d;
};
String.prototype.cutFrom = function(pos, fowardCount) {
  // will remove [ pos ; pos + fowardCount [
  pos = Math.max(pos, 0); // Check lower bound;
  fowardCount = Math.max(fowardCount, 0); // Check lower bound;
  return this.substr(0,pos) + this.substr(pos+fowardCount);
};

/* MEASUREMENT HELPER */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
