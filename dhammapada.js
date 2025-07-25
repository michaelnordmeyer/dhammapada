// Generates site from dhammapada.json (HTML, sitemap.xml, robots.txt).
// Needs assets/icons/icon.webp as favicon.
// Install on macOS with: brew install quickjs
// Build with: qjs --std dhammapada.js <canonicalUrlPrefix> <sitemapLastmodDate>
// Example: qjs --std dhammapada.js "https://example.com" "2024-01-01T12:00:00.000Z"

const htmlFileextension = "html";
const indexFilename = `index.${htmlFileextension}`;
const sitemapFilename = "sitemap.xml";

const canonicalUrlPrefix = scriptArgs[1];
const sitemapLastmodDate = scriptArgs[2];

const dhammapada = JSON.parse(std.loadFile("dhammapada.json"));

function generatePageStart(title, canonicalUrl) {
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="grey">
  <link rel="icon" type="image/webp" href="/assets/icons/icon.webp">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <title>${title}</title>
  <link rel="canonical" href="${canonicalUrlPrefix}/${canonicalUrl}">
</head>
<body>
  <main>`
}

function generatePageEnd() {
  return `
  </main>
</body>
</html>
`
}

function generateRobots() {
  const filename = "robots.txt";
  removeFile(filename);
  const file = openFile(filename);

  file.puts(`Sitemap: ${canonicalUrlPrefix}/${sitemapFilename}\n`);

  file.close();
}

function generateSitemapStart() {
  removeFile(sitemapFilename);
  const file = openFile(sitemapFilename);

  file.puts(`<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`);

  file.close();
}

function generateSitemapEntry(canonicalName) {
  const file = openFile(sitemapFilename);
  file.seek(0, std.SEEK_END);

  file.puts(`  <url>
    <loc>${canonicalUrlPrefix}/${canonicalName}</loc>
    <lastmod>${sitemapLastmodDate}</lastmod>
  </url>
`);

  file.close();
}

function generateSitemapEnd() {
  const file = openFile(sitemapFilename);
  file.seek(0, std.SEEK_END);

  file.puts("</urlset>\n");

  file.close();
}

function generateIndex(filename, canonicalName) {
  removeFile(filename);
  const file = openFile(filename);

  file.puts(generatePageStart(`${dhammapada.title} – ${dhammapada.subtitle}`, canonicalName));
  file.puts(`
    <article>
      <header>
        <h1>${dhammapada.title}</h1>
        <h2>${dhammapada.subtitle}</h2>
      </header>
      <p><em>${dhammapada.translation_note}</em></p>
      <p><a href="${dhammapada.pages[0].title.toLowerCase()}">${dhammapada.pages[0].title} by ${dhammapada.pages[0].author}</a></p>
      <p><a href="${dhammapada.pages[1].title.toLowerCase()}">${dhammapada.pages[1].title} by ${dhammapada.pages[1].author}</a></p>
      <h3>Chapters</h3>
      <ol>`);

  for (let chapterIndex = 0; chapterIndex < dhammapada.chapters.length; chapterIndex++) {
    file.puts(`\n        <li><a href="chapter-${chapterIndex + 1}/">${dhammapada.chapters[chapterIndex].title}</a></li>`);
  }

  file.puts(`
      </ol>
      <p>${dhammapada.copyright}</p>
`);

  for (let licenseIndex = 0; licenseIndex < dhammapada.license.length; licenseIndex++) {
    file.puts(`      <p>${dhammapada.license[licenseIndex]}</p>\n`);
  }

  file.puts(`      <hr>
      <ul>
        <li><a href="dhammapada.pdf" rel="noindex">The source PDF</a></li>
        <li><a href="dhammapada.json" rel="noindex">A JSON file with the PDF’s content for processing</a></li>
        <li><a href="dhammapada.js" rel="noindex">A JavaScript to generate these pages from above JSON</a></li>
      </ul>`);

  file.puts("\n    </article>");
  file.puts(generatePageEnd());

  file.close();

  generateSitemapEntry(canonicalName);
}

function generatePages() {
  for (let pageIndex = 0; pageIndex < dhammapada.pages.length; pageIndex++) {
    generatePage(dhammapada.pages[pageIndex]);
  }
}

function generatePage(page) {
  const filename = `${page.title.toLowerCase()}.${htmlFileextension}`;
  removeFile(filename);
  const file = openFile(filename);

  file.puts(generatePageStart(`${dhammapada.title} – ${page.title}`, page.title.toLowerCase()));
  file.puts(`
    <article>
      <header>
        <h1><a href="." accesskey="h">${dhammapada.title}</a></h1>
        <h2>${page.title}</h2>
      </header>
      <p><em>By ${page.author}</em></p>`);

  for (let contentIndex = 0; contentIndex < page.content.length; contentIndex++) {
    file.puts(`\n      <p>${page.content[contentIndex]}</p>`);
  }

  file.puts("\n    </article>");
  file.puts(generatePageEnd());

  file.close();

  generateSitemapEntry(page.title.toLowerCase());
}

function generateChapter(filename, canonicalName, chapterIndex) {
  removeFile(filename);
  const file = openFile(filename);

  file.puts(generatePageStart(`${dhammapada.title} – Chapter ${chapterIndex + 1}: “${dhammapada.chapters[chapterIndex].title}”`, canonicalName));
  file.puts(`
    <header>
      <h1><a href=".." accesskey="h">${dhammapada.title}</a></h1>
      <h2>Chapter ${chapterIndex + 1}: “${dhammapada.chapters[chapterIndex].title}”</h2>
    </header>
`);

  for (let verseIndex = 0; verseIndex < dhammapada.chapters[chapterIndex].verses.length; verseIndex++) {
    file.puts(`    <article>${dhammapada.chapters[chapterIndex].verses[verseIndex].no}. <a href="${dhammapada.chapters[chapterIndex].verses[verseIndex].no}">${dhammapada.chapters[chapterIndex].verses[verseIndex].verse}</a></article>\n`);
  }

  file.puts(`    <footer>
      <nav>
`);
  // Chapter linking
  let previousChapterLink;
  if (chapterIndex > 0) {
    const previousChapterIndex = chapterIndex - 1;
    previousChapterLink = `        <a rel="prev" href="../chapter-${previousChapterIndex + 1}/" accesskey="p">Chapter ${previousChapterIndex + 1}: “${dhammapada.chapters[previousChapterIndex].title}”</a>`;
  }

  let nextChapterLink;
  if (chapterIndex < dhammapada.chapters.length - 1) {
    const nextChapterIndex = chapterIndex + 1;
    nextChapterLink = `        <a rel="next" href="../chapter-${nextChapterIndex + 1}/" accesskey="n">Chapter ${nextChapterIndex + 1}: “${dhammapada.chapters[nextChapterIndex].title}”</a>`;
  }

  if (previousChapterLink !== undefined) {
    file.puts(`${previousChapterLink}\n`);
  }
  if (nextChapterLink !== undefined) {
    file.puts(`${nextChapterLink}\n`);
  }
  file.puts(`      </nav>
    </footer>`);

  file.puts(generatePageEnd());

  file.close();

  generateSitemapEntry(canonicalName);
}

function generateVerse(filename, canonicalName, chapterIndex, verseIndex) {
  removeFile(filename);
  const file = openFile(filename);

  file.puts(generatePageStart(`${dhammapada.title} – Chapter ${chapterIndex + 1}: “${dhammapada.chapters[chapterIndex].title}” – ${dhammapada.chapters[chapterIndex].verses[verseIndex].no}`, canonicalName));

  file.puts(`
    <article>
      <header>
        <h1><a href=".." accesskey="h">${dhammapada.title}</a></h1>
        <h2><a href="." accesskey="c">Chapter ${chapterIndex + 1}: “${dhammapada.chapters[chapterIndex].title}”</a></h2>
        <h3>${dhammapada.chapters[chapterIndex].verses[verseIndex].no}</h3>
      </header>
      <p>${dhammapada.chapters[chapterIndex].verses[verseIndex].verse}</p>
`);
  const footnote = dhammapada.chapters[chapterIndex].verses[verseIndex].footnote;
  if (footnote !== undefined) {
    file.puts(`      <hr>
      <p>${footnote}</p>
`);
  }

  file.puts(`      <footer>
        <nav>
`);
  // Verse linking. Some "numbers" cover more than one verse
  let previousVerseLink;
  if (verseIndex === 0) {
    if (chapterIndex > 0) {
      const previousVersesLength = dhammapada.chapters[chapterIndex - 1].verses.length;
      previousVerseLink = `          <a rel="prev" href="../chapter-${chapterIndex}/${dhammapada.chapters[chapterIndex - 1].verses[previousVersesLength - 1].no}" accesskey="p">Previous</a>`;
    }
  } else {
    previousVerseLink = `          <a rel="prev" href="${dhammapada.chapters[chapterIndex].verses[verseIndex - 1].no}" accesskey="p">Previous</a>`;
  }

  let nextVerseLink;
  if (verseIndex === dhammapada.chapters[chapterIndex].verses.length - 1) {
    if (chapterIndex !== dhammapada.chapters.length - 1) {
      nextVerseLink = `          <a rel="next" href="../chapter-${chapterIndex + 2}/${dhammapada.chapters[chapterIndex + 1].verses[0].no}" accesskey="n">Next</a>`;
    }
  } else {
    nextVerseLink = `          <a rel="next" href="${dhammapada.chapters[chapterIndex].verses[verseIndex + 1].no}" accesskey="n">Next</a>`;
  }

  if (previousVerseLink !== undefined) {
    file.puts(`${previousVerseLink}\n`);
  }
  if (nextVerseLink !== undefined) {
    file.puts(`${nextVerseLink}\n`);
  }
  file.puts(`        </nav>
      </footer>
`);

  file.puts("    </article>");
  file.puts(generatePageEnd());

  file.close();

  generateSitemapEntry(canonicalName);
}

generateRobots();
generateSitemapStart();
generateIndex(indexFilename, "");
generatePages();
// Generate chapter indexes
for (let chapterIndex = 0; chapterIndex < dhammapada.chapters.length; chapterIndex++) {
  const directoryName = `chapter-${chapterIndex + 1}`;
  createDirectory(directoryName);
  generateChapter(`${directoryName}/${indexFilename}`, `${directoryName}/`, chapterIndex);
  // Generate verses for chapter
  for (let verseIndex = 0; verseIndex < dhammapada.chapters[chapterIndex].verses.length; verseIndex++) {
    generateVerse(`${directoryName}/${dhammapada.chapters[chapterIndex].verses[verseIndex].no}.${htmlFileextension}`, `${directoryName}/${dhammapada.chapters[chapterIndex].verses[verseIndex].no}`, chapterIndex, verseIndex);
  }
}
generateSitemapEnd();

function openFile(filename) {
  print(`Opening file ${filename} for writing...`);

  const fd = os.open(filename, os.O_CREAT | os.O_RDWR);
  // print("File descriptor: " + fd);
  const error = { errno: 0 };
  const file = std.fdopen(fd, "w+", error);
  if (error.errno != 0) {
    print(`File open ${filename} error: ${std.strerror(error.errno * -1)}`);
    os.close(fd);
    std.exit(error.errno * -1);
  }

  return file;
}

function removeFile(filename) {
  const errno = os.remove(filename) * -1;
  if (errno != 0) {
    if (errno == 2) {
      // No such file or directory
    } else {
      print(`Remove ${filename} error: ${std.strerror(errno)}`);
      std.exit(errno);
    }
  }
}

function createDirectory(directoryName) {
  // Remove all files in directory first
  const files = os.readdir(directoryName);
  if (files[1] != 0) {
    if (files[1] == 2) {
      // No such file or directory
      const errno = os.mkdir(directoryName) * -1;
      if (errno != 0) {
        print(`Create directory ${directoryName} error: ${std.strerror(errno)}`);
        std.exit(errno);
      }
    } else {
      print(`Read directory ${directoryName} error: ${std.strerror(files[1])}`);
      std.exit(files[1]);
    }
  } else {
    // Delete all files in directory
    for (const filename in files[0]) {
      // print(`Filename '${files[0][filename]}', ${typeof(files[0][filename])}`);
      if (files[0][filename] !== '.' && files[0][filename] !== '..') {
        removeFile(`${directoryName}/${files[0][filename]}`);
      }
    }
  }
}
