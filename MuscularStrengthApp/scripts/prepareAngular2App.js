const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = function(context) {
    console.log('Building Angular 2 application into "./www" directory.');
    const basePath = context.opts.projectRoot;
    const baseWWW = basePath + '/www';

    console.log(execSync(
      "ng build --target=production --environment=prod --output-path MuscularStrengthApp/www/  --base-href .",
      {
        maxBuffer: 1024*1024,
        cwd: basePath + '/..'
      }).toString('utf8')
    );
    // Clean up files after build is successful
    var files = fs.readdirSync(baseWWW);
    for (var i = 0; i < files.length; i++) {
      if (files[i].endsWith('.gz')) {
        fs.unlinkSync(baseWWW + '/' + files[i]);
      }
    }
};