// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import gulp from 'gulp';
import { argv } from 'yargs';
import path from 'path';
import nodemon from 'gulp-nodemon';
import grommetToolbox, { getOptions } from 'grommet-toolbox';

gulp.task('set-webpack-alias', function () {
  const options = getOptions();
  if (options.alias && argv.useAlias) {
    options.webpack.resolve.alias = options.alias;
  }
});

gulp.task('start-backend', function() {
  nodemon({
    script: path.resolve(__dirname, 'server/server')
  });
});

grommetToolbox(gulp);
