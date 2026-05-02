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
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
</head>
<body>
  <nav><a class="top-buttons" href="../../">← home</a> <a class="top-buttons" href="../">← blog</a></nav>
  <article>
    <h1 data-aos="fade-down">${title}</h1>
    <time data-aos="zoom-out">${date}</time>
    ${content}
  </article>

  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
  <script>
    AOS.init({
      once: true
    });
  </script>
</body>
</html>`;

const posts = [];

for (const file of readdirSync('./posts-src')) {
  if (!file.endsWith('.md')) continue;

  const raw = readFileSync(`./posts-src/${file}`, 'utf-8');

  const lines = raw.split('\n');
  const title = lines[0].replace('title: ', '').trim();
  const date  = lines[1].replace('date: ', '').trim();
  const body  = lines.slice(2).join('\n');

  const html = template(title, marked(body), date);
  const slug = file.replace('.md', '');

  writeFileSync(`./blog/posts/${slug}.html`, html);
  posts.push({ title, date, slug });
}

const lists = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(p => `
    <ul data-aos="fade-up" class="post-list">
      <li>
        <time>${p.date}</time> 
        <a href="posts/${p.slug}.html">${p.title}</a>
      </li>
    </ul>
  `)
  .join('\n');

writeFileSync('./blog/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blog</title>
  <link rel="stylesheet" href="blog.css">
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
</head>
<body>
  <nav><a class="top-buttons" href="../index.html">← home</a></nav>
  <h1 data-aos="fade-up" >Blog</h1>
  ${lists}
  <footer>
    <p>© 2026 Technick</p>
  </footer>

  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
  <script>
    AOS.init({
      once: true
    });
  </script>
</body>
</html>`);

console.log(`Built ${posts.length} posts.`);
