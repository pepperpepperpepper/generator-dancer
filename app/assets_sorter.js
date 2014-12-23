#!/usr/bin/env node
var _ = require('underscore');

module.exports = {};

function _js_score(path){
  //higer the score, the farther down the list it goes
  var score_table = {
    modernizr : { reg : /\/modernizr\.(?:min\.)?js$/ig, score : 1 },
    yepnope : { reg : /\/yepnope\.(?:min\.)?js$/ig, score : 2 },
    jquery : { reg : /\/jquery\.(?:min\.)?js$/ig, score : 3 },
    zepto : { reg : /\/zepto\.(?:min\.)?js$/ig, score : 4 },
    json2 : { reg : /\/json2\.(?:min\.)?js$/ig, score : 5 },
    jquerymobile : { reg : /\/jquery\.mobile\.(?:min\.)?js$/ig, score : 6 },
    jqueryui : { reg : /\/jquery\-ui\.(?:min\.)?js$/ig, score : 7 },

    underscore : { reg : /\/underscore\.(?:min\.)?js$/ig, score : 15 },
    underscorelodash : { reg : /\/underscore\-lodash\.(?:min\.)?js$/ig, score : 16 },
    
    lodash : { reg : /\/lodash\.(?:min\.)?js$/ig, score : 12 },

    prototype : { reg : /\/prototype\.(?:min\.)?js$/ig, score : 20 },
    scriptaculous : { reg : /\/scriptaculous\.(?:min\.)?js$/ig, score : 21 },
    angular : { reg : /\/angular\.(?:min\.)?js$/ig, score : 30 },
    scriptaculous : { reg : /\/angular-material\.(?:min\.)?js$/ig, score : 31 },
    
  }
  var match = _.find(score_table, function(elem){
     return elem.reg.test(path);
   });
  if (match) return match.score;
  return 1000;
}

module.exports.sort_js function(arr){
  return arr.sort(function(a,b){
    return _js_score(a) - _js_score(b);
  })
}


