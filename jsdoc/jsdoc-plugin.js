var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

function Plugin(options) {
  this.configPath = options.conf;
  this.rootPath = path.parse(options.conf).dir;
  this.jsdocRoot = path.join(__dirname, '..', 'node_modules', 'jsdoc');
  this.tempConfigFile = path.join(this.rootPath, 'jsdoc-' + Date.now() + '.temp.json');
}


Plugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin('emit', function (compilation, callback) {
    console.log('\x1b[33m%s\x1b[0m', '[JSDOC] Start generating');

    var configJson = JSON.parse(fs.readFileSync(self.configPath, 'utf-8'));
    //configJson.source.include = path.join(self.rootPath, configJson.source.include);

    if(Array.isArray(configJson.source.include)) {
      var newArray = configJson.source.include.map(file=> path.join(self.rootPath, file));
      configJson.source.include = newArray;
    } else {
      configJson.source.include = path.join(self.rootPath, configJson.source.include);
    }

    if (configJson.hasOwnProperty('opts')) {
      if(configJson.opts.hasOwnProperty('template'))
        configJson.opts.template = path.join(self.rootPath, configJson.opts.template);

      if(configJson.opts.hasOwnProperty('tutorials'))
        configJson.opts.tutorials = path.join(self.rootPath, configJson.opts.tutorials);

      if(configJson.opts.hasOwnProperty('destination'))
        configJson.opts.destination = path.join(self.rootPath, configJson.opts.destination);
    }

    fs.writeFileSync(self.tempConfigFile, JSON.stringify(configJson), 'utf-8');

    if(/^win/.test(process.platform))
        jsdoc = spawn( 'jsdoc.cmd', ['-p','-c', self.tempConfigFile], { cwd: self.jsdocRoot });
    else
        jsdoc = spawn( path.join(self.jsdocRoot, 'jsdoc.js'), ['-p', '-c', self.tempConfigFile] );

    jsdoc.stdout.on('data', function (data) { console.log('\x1b[33m%s\x1b[0m', '[JSDOC] ' + data.toString()); });
    jsdoc.stderr.on('data', function (data) { console.error('\x1b[31m%s\x1b[0m', '[JSDOC] ' + data.toString()); });
    jsdoc.on('close', function () {
        fs.unlinkSync(self.tempConfigFile);
        console.log('\x1b[33m%s\x1b[0m', 'JsDoc Generated');
        callback();
    });
  });

  compiler.plugin('done', function (stats) {
    console.log('\x1b[33m%s\x1b[0m','[JSDOC] Finished generating');
    console.log('\x1b[33m%s\x1b[0m','[JSDOC] TOTAL TIME:', stats.endTime - stats.startTime);
  });
};

module.exports = Plugin;
