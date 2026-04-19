import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { marked } from 'marked';

const template = (title, content, date) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="../blog.css">
</head>
<body>
  <nav><a class="top-buttons" href="../../">← home</a> <a class="top-buttons" href="../">← blog</a></nav>
  <article>
    <h1>${title}</h1>
    <time>${date}</time>
    ${content}
  </article>
</body>
</html>`;

const posts = [];

for (const file of readdirSync('./posts-src')) {
  if (!file.endsWith('.md')) continue;

  const raw = readFileSync(`./posts-src/${file}`, 'utf-8');

  // Expects a frontmatter-style header at the top:
  // title: My Post Title
  // date: 2025-04-18
  const lines = raw.split('\n');
  const title = lines[0].replace('title: ', '').trim();
  const date  = lines[1].replace('date: ', '').trim();
  const body  = lines.slice(2).join('\n');

  const html = template(title, marked(body), date);
  const slug = file.replace('.md', '');

  writeFileSync(`./blog/posts/${slug}.html`, html);
  posts.push({ title, date, slug });
}

// Generate blog/index.html listing
const listItems = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(p => `<li><time>${p.date}</time> <a href="${p.slug}.html">${p.title}</a></li>`)
  .join('\n');

writeFileSync('./blog/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blog</title>
  <link rel="stylesheet" href="blog.css">
</head>
<body>
  <nav><a class="top-buttons" href="../index.html">← home</a></nav>
  <h1>Blog</h1>
  <ul class="post-list">${listItems}</ul>
</body>
</html>`);

console.log(`Built ${posts.length} posts.`);
