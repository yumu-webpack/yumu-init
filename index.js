#!/usr/bin/env node

'use strict';

var unzip = require('unzip');
var download = require('download');
var fs = require('fs');
var process = require('process');
var child_process = require('child_process');
var inquirer = require('inquirer');
var chalk = require('chalk');

var url = 'https://github.com/yumu-webpack/yumu-template/archive/master.zip';

module.exports = {
  url: url,
  init: function(url, preName) {
    console.log(chalk.blue('you are downloading the remote files from "https://github.com/yumu-webpack/yumu-template"'));
    download(url, process.cwd()).then((data) => {
    	var unzipExtractor = unzip.Extract({ path: process.cwd() });
    	unzipExtractor.on('error', function(err) {
        fs.unlinkSync('yumu-template-master.zip');
        throw err;
      });
      unzipExtractor.on('close', handleFiles.bind(this, preName));
      fs.createReadStream('yumu-template-master.zip')
    		.pipe(unzipExtractor);
    });
  }
}

function handleFiles(preName) {
  console.log(chalk.yellow('Load success'));
  var pkgPath = process.cwd() + '/yumu-template-master/package.json';
  fs.exists(process.cwd() + '/yumu-template-master', function (exists) {
    var projectName = 'react-demo';
    if(typeof(preName) != 'undefined') {
      projectName = preName;
    }
    var pkg = require(pkgPath);
    inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        default: projectName,
        message: 'your project name? '
      }, {
        type: 'input',
        name: 'version',
        default: pkg.version,
        message: 'your project version?'
      }, {
        type: 'input',
        name: 'description',
        message: 'your project description?'
      }, {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to install the dependencies?',
      }
    ]).then(function(answers) {
      pkg.name = answers.projectName;
      pkg.version = answers.version;
      pkg.description = answers.description;
      fs.unlinkSync(pkgPath);
      fs.unlinkSync('yumu-template-master.zip');
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      fs.renameSync(process.cwd() + '/yumu-template-master', process.cwd() + '/' + answers.projectName);
      if(answers.confirm) {
        var commends = [
          'cd ' + answers.projectName,
          'npm install'
        ]
        commends.forEach(function(item) {
          var getResult
          try {
            getResult = child_process.execSync(item, { encoding: 'utf8' });
          } catch(err) {
            console.log(err.stderr);
          }
          process.stdout.write(getResult);
        });
      }
    })
  });
}
