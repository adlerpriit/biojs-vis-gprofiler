# biojs-vis-gprofiler

[![NPM version](http://img.shields.io/npm/v/biojs-vis-gprofiler.svg)](https://www.npmjs.org/package/biojs-vis-gprofiler)
[![Build Status](https://travis-ci.org/tambeta/biojs-vis-gprofiler.svg?branch=master)](https://travis-ci.org/tambeta/biojs-vis-gprofiler)

Retrieve most relevant terms from g:Profiler and render these as a string
cloud.

## Getting Started

Install the module with: `npm install biojs-vis-gprofiler`. Copy the minified
module `build/biojsvisgprofiler.min.js` to your scripts directory.

Usage without a module loader:

```html
<script src="/path/to/biojsvisgprofiler.min.js"></script>
<script type="text/javascript">

document.addEventListener("DOMContentLoaded", function(e) {
  gp = new biojsVisGprofiler({
    container : "#myContainer",
    width     : 600,
    height    : 600,
  });

  gp.on("onrender", function() {
    console.log("caught render event");
  });

  gp.render({
    query     : ["swi4", "swi6", "mbp1", "mcm1", "fkh1", "fkh2"],
    organism  : "scerevisiae",
  });
});

</script>
```

If using a module loader such as [require.js](http://requirejs.org/docs/start.html)
`require` the module from within your application or directly, such as:

```html
<script src="require.js"></script>
<script>

require(['/path/to/biojsvisgprofiler.min.js'], function(biojsVisGprofiler) {
	...
});

</script>
```

## Documentation

@@include('./docs.md')

## Contributing

Please submit all issues and pull requests to the
[tambeta/biojs-vis-gprofiler](http://github.com/tambeta/biojs-vis-gprofiler) repository!

## Support

If you have any problems or a suggestion please open an issue
[here](https://github.com/tambeta/biojs-vis-gprofiler/issues).

## License

The BSD License

Copyright (c) 2014, Tambet Arak

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the Tambet Arak nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
