import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { marked } from 'marked';

const postTemplate = (title, content, date) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Technick</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="../blog.css">
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
</head>
<body>
  <div class="blog-container">
    <nav class="site-nav">
      <a href="../../" class="nav-brand">Technick</a>
      <div class="nav-links">
        <a href="../../">Home</a>
        <a href="../">Blog</a>
      </div>
    </nav>
  </div>
  <article>
    <h1>${title}</h1>
    <time data-aos="fade-right" data-aos-delay="100">${date}</time>
    <div data-aos="fade-up" data-aos-delay="150">${content}</div>
  </article>

  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
  <script>
    AOS.init({ once: true, duration: 450, offset: 40 });
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

  const html = postTemplate(title, marked(body), date);
  const slug = file.replace('.md', '');

  writeFileSync(`./blog/posts/${slug}.html`, html);
  posts.push({ title, date, slug });
}

const listItems = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(p => `    <li><time>${p.date}</time><a href="posts/${p.slug}.html">${p.title}</a></li>`)
  .join('\n');

writeFileSync('./blog/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | Technick</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="blog.css">
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
</head>
<body>
  <div class="blog-container">
    <nav class="site-nav">
      <a href="../" class="nav-brand">Technick</a>
      <div class="nav-links">
        <a href="../">Home</a>
        <a href="../about.html">About</a>
      </div>
    </nav>

    <h1 class="blog-title">Blog</h1>
    <ul class="post-list" data-aos="fade-up" data-aos-delay="100">
${listItems}
    </ul>

    <footer>
      <p>© 2026 Technick</p>
    </footer>
  </div>

  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
  <script>
    AOS.init({ once: true, duration: 450, offset: 40 });
  </script>
</body>
</html>`);

console.log(`Built ${posts.length} posts.`);
