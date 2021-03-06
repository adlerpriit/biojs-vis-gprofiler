
/**
 * Construct a GProfiler object.
 *
 * @constructor
 */

function GProfiler() {
  this.$ = require('jquery-browserify');

  var attrs = {
    GP_ROOT_URL   : 'http://biit.cs.ut.ee/gprofiler/',
    MAX_URL_LEN   : 4096,
    activeQuery  : undefined
  };

  this.$.extend(this, attrs);
}

/**
 * Query g:Profiler.
 *
 * @function
 * @param {Object} attrs - g:Profiler query attributes. See
 *  [g:Profiler](http://biit.cs.ut.ee/gprofiler) for detailed documentation on
 *  these parameters.
 * @param {Function} cb - A callback function receiving the result object from
 *  a g:Profiler query.
 *
 * Fields of _attrs_:
 *
 * @property {Array} query - A list of query symbols. _required_
 * @property {String} organism -  The organism name in g:Profiler format,
 *  generally the first character of the genus + species in lowercase. E.g.
 *  "Mus musculus" -> "mmusculus". _default_: hsapiens
 * @property {boolean} significant - Only return statistically significant
 *  results. _default_: true
 * @property {boolean} orderedQuery - Ordered query. _default_: false.
 * @property {boolean} regionQuery - The query consists of chromosomal
 *  regions. _default_: false.*
 * @property {boolean} excludeIEA - Exclude electronic GO annotations.
 *  _default_: false.
 * @property {boolean} underrep - Measure underrepresentation. _default_: false.
 * @property {String} hierFiltering - Hierarchical filtering, one of "none",
 *  "moderate", "strong". _default_: none.
 * @property {float} maxPValue - Custom p-value threshold. _default_: 1.0.
 * @property {int} minSetSize - Minimum size of functional category.
 * @property {int} maxSetSize - Maximum size of functional category.
 * @property {String} correctionMethod - Algorithm used for determining the
 *  significance threshold, one of "gSCS", "fdr", "bonferroni". _default_:
 *  "gSCS".
 * @property {String} domainSize - Statistical domain size, one of "annotated",
 *  "known". _default_: annotated.
 * @property {String} numericNS - Namespace to use for fully numeric IDs.
 * @property {Array} customBG - Array of symbols to use as a statistical
 *  background.
 * @property {Array} srcFilter - Array of data sources to use. Currently these
 *  include GO (GO:BP, GO:MF, GO:CC to select a particular GO branch), KEGG,
 *  REAC, TF, MI, CORUM, HP. Please see the
 *  [g:GOSt web tool](http://biit.cs.ut.ee/gprofiler/) for the comprehensive
 *  list and details on incorporated data sources.
 */

GProfiler.prototype.query = function(attrs, cb) {
  var _this = this;
  var $ = _this.$;
  var url = _this.getRootURL();
  var postdata = {};

  if (!cb || !(cb instanceof Function))
    throw new Error('The cb parameter is required and must be a function');

  $.extend(
    postdata, {output : 'mini'},
    _this.getQueryParams(attrs)
  );

  $.post(url, postdata, function(data) {
    var r = _this._parseResult(data);
    cb.apply(_this, [r]);
  });
};

/**
 * Return the HTTP request parameters for a query.
 *
 * @function
 * @param {Object} queryAttrs - See the documentation for [GProfiler#query]. If
 *  not specified, the active query (the last query executed via
 *  [GProfiler#query]) is used. Otherwise, an error is thrown.
 *
 * @returns {Object}
 */

GProfiler.prototype.getQueryParams = function(queryAttrs) {
  var _this = this;
  var $ = _this.$;
  var txSrcFilter;
  var txHierFiltering;
  var defaults;
  var postdata;

  queryAttrs =
    queryAttrs || this.activeQuery;
  if ($.type(queryAttrs) !== 'object')
    throw new Error('No active query associated with GProfiler object');

  // Compile and check query attributes

  defaults = {
    query               : undefined,
    organism            : 'hsapiens',
    significant         : true,
    sortByStructure     : true,
    orderedQuery        : false,
    regionQuery         : false,
    excludeIEA          : false,
    underrep            : false,
    hierFiltering       : 'none',
    maxPValue           : 1.0,
    minSetSize          : 0,
    maxSetSize          : 0,
    correctionMethod    : 'analytical',
    domainSize          : 'annotated',
    numericNS           : undefined,
    customBG            : [],
    srcFilter           : [],
  };

  if (queryAttrs.correctionMethod === 'gSCS')
    queryAttrs.correctionMethod = 'analytical';
  queryAttrs = $.extend({}, defaults, queryAttrs);

  if (!queryAttrs.query)
    throw new Error('The query parameter is required');
  if (!(queryAttrs.query instanceof Array))
    queryAttrs.query = [queryAttrs.query];
  this.activeQuery = queryAttrs;

  // Transform query attributes to g:Profiler API format

  txSrcFilter = function(srcs) {
    var r = [];
    $.each(srcs, function(i, v) {
      r.push(['sf_' + v, '1']); });
    return r;
  };

  txHierFiltering = function(hf) {
    var r = ['hierfiltering'];

    if (hf === 'moderate')
      r.push('compact_rgroups');
    else if (hf === 'strong')
      r.push('compact_ccomp');
    else
      r.push('none');
    return [r];
  };

  postdata = _this._transformAttrs(queryAttrs, defaults, {
    sortByStructure   : 'sort_by_structure',
    orderedQuery      : 'ordered_query',
    excludeIEA        : 'no_iea',
    regionQuery       : 'as_ranges',
    hierFiltering     : txHierFiltering,
    maxPValue         : 'user_thr',
    minSetSize        : 'min_set_size',
    maxSetSize        : 'max_set_size',
    correctionMethod  : 'threshold_algo',
    domainSize        : 'domain_size_type',
    numericNS         : 'prefix',
    customBG          : 'custbg',
    srcFilter         : txSrcFilter
  });

  return postdata;
};

/**
 * Return g:Profiler URL encoding a query.
 *
 * @function
 * @param {Object} queryAttrs - See the documentation for [GProfiler#query]. If
 *  not specified, the active query (the last query executed via
 *  [GProfiler#query]) is used. Otherwise, an error is thrown.
 *
 * @returns {String|null} If the resulting URL lengths exceeds the maximum
 *  allowed length, `null` is returned.
 */

GProfiler.prototype.getQueryURL = function(queryAttrs) {
  var _this = this;
  var $ = _this.$;
  var url =
    _this.getRootURL() + '?';
  var postdata =
    _this.getQueryParams(queryAttrs);

  $.each(postdata, function(k, v) {
    url += k + '=' + encodeURIComponent(v) + '&'; });
  if (url.length > _this.MAX_URL_LEN)
    return null;
  return url;
};

/**
 * Return g:Profiler root URL.
 *
 * @returns {String}
 */

GProfiler.prototype.getRootURL = function() {
  return this.GP_ROOT_URL;
};

GProfiler.prototype._transformAttrs = function(attrs, typehints, tforms) {

  // Transform an object of attributes into HTTP POST data for jQuery.post.
  //
  // - typehints - an object with keys corresponding to the attrs object. This
  //   is used for hints about the desired type of an attribute, currently only
  //   used for detecting boolean values. This may conveniently be the default
  //   values object.
  // - tforms - an object of keyed by incoming attribute name; if the value is
  //   a string, then the HTTP POST parameter is renamed to this string; if the
  //   value is a function, it is expected to return an array of name - value
  //   pairs.

  var _this = this;
  var $ = _this.$;
  var r = {};

  typehints = typehints || {};
  tforms = tforms || {};

  $.each(attrs, function(k, v) {
    var tx = tforms[k] || k;
    var name = tx;

    // Specific transforms

    if ($.type(tx) === 'function') {
      var txr = tx.apply(_this, [v]);

      $.each(txr, function(i, w) {
        r[w[0]] = String(w[1]); });
      return true;
    }

    // Automatic transforms for various types

    if ($.type(typehints[k]) === 'boolean') {
      r[name] = v ? '1' : '0';
      return true;
    }

    if ($.type(v) === 'array') {
      if (v.length === 0)
        return true;
      r[name] = v.join(' ');
    }
    else if ($.type(v) === 'undefined' || $.type(v) === 'null') {
      return true;
    }
    else {
      r[name] = String(v);
    }
  });

  return r;
};

GProfiler.prototype._parseResult = function(data) {
  var $ = this.$;
  var r = [];
  var rows = data.split('\n');

  $.each(rows, function(i, row) {
    var term;
    var desc;
    var ro = {};

    if (row.match(/\s*^#/) || row.length < 14)
      return true;    
    row = $.map(
      row.split(/\t/), 
      function(f) { return $.trim(f); }
    );

    ro['significant']    = row[1] ? true : false;
    ro['p_value']        = parseFloat(row[2]);
    ro['term_size']      = parseInt(row[3]);
    ro['query_size']     = parseInt(row[4]);
    ro['overlap_size']   = parseInt(row[5]);
    ro['precision']      = parseFloat(row[6]);
    ro['recall']         = parseFloat(row[7]);
    ro['term_id']        = row[8];
    ro['domain']         = row[9];
    ro['subgraph']       = row[10];
    ro['term_name']      = row[11];
    ro['depth']          = row[12];
    ro['intersection']   = row[13] ? row[13].split(',') : [];

    r.push(ro);
  });

  return r;
};

if (module && typeof module === 'object' && module.exports)
  module.exports = new GProfiler();
