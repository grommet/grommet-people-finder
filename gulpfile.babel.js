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

gulp.task('release:createTmp', (done) => {
  del.sync(['./tmp']);
  mkdirp('./tmp', (err) => {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('release:heroku', ['dist', 'release:createTmp'], (done) => {
  if (process.env.CI) {
    git.clone('https://' + process.env.GH_TOKEN + '@github.com/grommet/grommet-people-finder.git',
      {
        cwd: './tmp/'
      },
      (err) => {
        if (err) {
          throw err;
        }

        process.chdir('./tmp/grommet-people-finder');
        git.checkout('heroku', (err) => {
          if (err) {
            throw err;
          }

          del.sync(['./**/*']);

          gulp.src(['../../**'])
          .pipe(gulp.dest('./')).on('end', () => {
            git.status({
              args: '--porcelain'
            }, (err, stdout) => {
              if (err) {
                throw err;
              }

              if (stdout && stdout !== '') {
                gulp.src('./')
                  .pipe(git.add({
                    args: '--all'
                  }))
                  .pipe(git.commit('Heroku version update.')).on('end', () => {
                    git.push('origin', 'heroku', { quiet: true }, (err) => {
                      if (err) {
                        throw err;
                      }

                      process.chdir(__dirname);
                      done();
                    });
                  });
              } else {
                console.log('No difference since last commit, skipping heroku release.');

                process.chdir(__dirname);
                done();
              }
            });
          });
        });
      }
    );
  } else {
    console.warn('Skipping release. Release:heroku task should be executed by CI only.');
  }
});

grommetToolbox(gulp);
