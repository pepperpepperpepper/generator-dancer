var fs = require('fs');
module.exports = function(ascii_file, cb){ 
  
  fs.readFile(ascii_file, function(err, data){
    if (err){ 
      console.log('ERROR: Could not open '+ascii_file);
      console.log('ERROR: '+err.toString());
      process.exit(1);
    }
    process.stdout.write(data) 
    console.log("\n");
    cb();
  });
};
