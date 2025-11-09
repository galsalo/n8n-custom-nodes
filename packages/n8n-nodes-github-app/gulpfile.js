const { src, dest } = require('gulp');

function buildIcons() {
  return src(['nodes/**/*.svg', 'nodes/**/*.png'])
    .pipe(dest('dist/nodes'));
}

function buildNodeJson() {
  return src('nodes/**/*.json')
    .pipe(dest('dist/nodes'));
}

exports.build = exports.default = function(callback) {
  buildIcons();
  buildNodeJson();
  callback();
};
