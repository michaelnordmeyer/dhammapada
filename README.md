# A Dhammapada Site Generated from JSON

This repository will generate a [static website having the Dhammapada as content](https://dhammapada.michaelnordmeyer.com/).

It generates from `dhammapada.json` the HTM, a sitemap.xml, and a robots.txt. It needs `quickjs` for that, a tiny JavaScript interpreter, which can be installed on macOS with [Homebrew](https://brew.sh/): `brew install quickjs`

The `Makefile` has everything to make and deploy the site. Its configuration is located at the beginning.

For successful generation of the favicon with `generate-icon.sh`, a font with the used Unicode character of the wheel of dharma has to exist at the location declared in the script. Depending on the font, the centering of the character has to be adjusted. It works out-of-the-box on macOS, if `imagemagick` was installed with `brew install imagemagick`.

## License

With the exception of the included `dhammpada.pdf`, which is the source for the content and has its own license noted below, all code is licensed under:

```text
MIT License

Copyright 2025 Michael Nordmeyer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Dhammapada.pdf License

The `dhammapada.pdf` is copyright © 1985, Buddhist Publication Society Kandy, Sri Lanka. Their license, which is taken from the PDF, states:

> For free distribution only. You may print copies of this work for your personal use. You may reformat and redistribute this work for use on computers and computer networks, provided that you charge no fees for its distribution or use. Otherwise, all rights reserved.
