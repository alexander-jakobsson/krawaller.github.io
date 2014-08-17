
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-templates');
var async = require('async');
var extend = require('extend');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run files through any template in a template `dir`.
 *
 * @param {String or Object} options
 *   @property {String} engine
 *   @property {String} directory (optional)
 *   @master {String} name of postprocessing master template (optional)
 * @return {Function}
 */

function plugin(opts){
  if ('string' == typeof opts) opts = { engine: opts };
  opts = opts || {};
  var engine = opts.engine;
  var dir = opts.directory || 'templates';

  if (!opts.engine) throw new Error('"engine" option required');

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();

    async.each(Object.keys(files),function(file, done){
      debug('checking file: %s', file);
      var data = files[file];
      if (!data.template && !opts.master) return done();
      data.contents = data.contents.toString();
      var templates = (data.template ? [metalsmith.join(dir, data.template)] : []).concat( opts.master ? [metalsmith.join(dir, opts.master)] : [] );
      var clone = extend({}, metadata, data);
      async.eachSeries(templates,function(tmplname,done){
        consolidate[engine](tmplname, clone, function(err, str){
          debug('%s   --------->   %s', file, tmplname);
          if (err) return done(err);
          data.contents = clone.contents = new Buffer(str);
          done();
        });
      },done);
    },done);
  };
}