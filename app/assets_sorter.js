#!/usr/bin/env node
var obj = { less :  [ '/home/pepper/latest/static/vendor/less/bootstrap.less' ],
  css :
   [ '/home/pepper/latest/static/vendor/css/unsemantic-grid-responsive-no-ie7.css',
     '/home/pepper/latest/static/vendor/css/bootstrap.css',
     '/home/pepper/latest/static/vendor/css/unsemantic-grid-responsive-tablet-no-ie7.css' ],
  js :
   [ '/home/pepper/latest/static/vendor/js/fancybox.js',
     '/home/pepper/latest/static/vendor/js/threejs.js',
     '/home/pepper/latest/static/vendor/js/underscore.js',
     '/home/pepper/latest/static/vendor/js/jquery.js',
     '/home/pepper/latest/static/vendor/js/jquery-ui.js',
     '/home/pepper/latest/static/vendor/js/bootstrap.js' ],
  fonts :
   [ '/home/pepper/latest/static/vendor/fonts/glyphicons-halflings-regular.woff',
     '/home/pepper/latest/static/vendor/fonts/glyphicons-halflings-regular.ttf',
     '/home/pepper/latest/static/vendor/fonts/glyphicons-halflings-regular.svg',
     '/home/pepper/latest/static/vendor/fonts/glyphicons-halflings-regular.eot' ] }

function js_score(path){
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
  for(var i = 0; i < Object.keys(score_table).length; i++){
    if(score_table[Object.keys(score_table)[i]]['reg'].exec(path)){
      return score_table[Object.keys(score_table)[i]]['score'];
    }
  }
  return 1000;
}


function sort_js(arr){
  return arr.sort(function(a,b){
    return js_score(a) - js_score(b);
  })
}

console.log(sort_js(obj.js))
