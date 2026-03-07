const fs = require('fs');
const path = require('path');
const marked = require('marked');

const journalDir = './journal';
const files = fs.readdirSync(journalDir);

let postsData = [];

// 1. Loop through every file in the journal folder
files.forEach(file => {
    // Only process Markdown files
    if (file.endsWith('.md')) {
        const filePath = path.join(journalDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract the SEO "Front Matter" (title, description, date) at the top of the file
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

        if (match) {
            const frontMatter = match[1];
            const markdownBody = match[2];

            // Pull out the specific data points
            const titleMatch = frontMatter.match(/title:\s*"(.*?)"/);
            const descMatch = frontMatter.match(/description:\s*"(.*?)"/);
            const dateMatch = frontMatter.match(/date:\s*(.*?)$/m);

            const title = titleMatch ? titleMatch[1] : 'Untitled';
            const description = descMatch ? descMatch[1] : '';
            const date = dateMatch ? dateMatch[1].trim() : '';

            const htmlFileName = file.replace('.md', '.html');

            // Convert the markdown text to HTML
            const htmlContent = marked.parse(markdownBody);

            // 2. Build the individual article webpage
            const postPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | LifeStyle Barber</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <header class="sticky-nav">
        <div class="nav-container">
            <div class="brand-logo">LifeStyle Barber</div>
            <nav>
                <ul class="nav-links">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="/journal">The Journal</a></li>
                </ul>
            </nav>
            <a href="https://www.vagaro.com/lifestylebarber/book-now" target="_blank" class="btn-book">Book Now</a>
        </div>
    </header>
    <main style="max-width: 800px; margin: 120px auto 60px; padding: 0 20px; line-height: 1.8; color: var(--charcoal);">
        ${htmlContent}
    </main>
    <footer>
        <div class="container text-center">
            <p>&copy; 2026 LifeStyle Barber. All Rights Reserved.</p>
        </div>
    </footer>
</body>
</html>`;

            // Save the compiled HTML file
            fs.writeFileSync(path.join(journalDir, htmlFileName), postPage);

            // Save the data to build the directory card later
            postsData.push({ title, description, date, url: htmlFileName });
        }
    }
});

// Sort the posts from newest to oldest
postsData.sort((a, b) => new Date(b.date) - new Date(a.date));

// 3. Build the grid of cards for the Journal Directory
let cardsHtml = postsData.map(post => `
    <article style="border: 1px solid #ddd; border-radius: 8px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
        <p style="font-size: 0.9rem; color: #888; margin-bottom: 10px;">${post.date}</p>
        <h2 style="font-size: 1.5rem; margin-bottom: 15px; color: var(--charcoal); line-height: 1.3;">
            <a href="${post.url}" style="text-decoration: none; color: inherit;">${post.title}</a>
        </h2>
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px; flex-grow: 1;">${post.description}</p>
        <a href="${post.url}" style="font-weight: bold; color: var(--dark-blue); text-decoration: none; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Read the Intel &rarr;</a>
    </article>
`).join('');

// 4. Build the final Journal Directory webpage (index.html)
const directoryPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Journal | LifeStyle Barber</title>
    <meta name="description" content="Expert grooming insights, hair chemistry, and barbershop traditions.">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <header class="sticky-nav">
        <div class="nav-container">
            <div class="brand-logo">LifeStyle Barber</div>
            <nav>
                <ul class="nav-links">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="/journal">The Journal</a></li>
                </ul>
            </nav>
            <a href="https://www.vagaro.com/lifestylebarber/book-now" target="_blank" class="btn-book">Book Now</a>
        </div>
    </header>
    <main style="max-width: 1000px; margin: 120px auto 60px; padding: 0 20px;">
        <div style="text-align: center; margin-bottom: 4rem;">
            <h1 style="font-size: 2.8rem; color: var(--charcoal); margin-bottom: 0.5rem;">The Journal</h1>
            <p style="font-size: 1.2rem; color: #555;">Mastery, discipline, and the science of hair design.</p>
        </div>
        <div style="display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            ${cardsHtml}
        </div>
    </main>
    <footer>
        <div class="container text-center">
            <p>&copy; 2026 LifeStyle Barber. All Rights Reserved.</p>
        </div>
    </footer>
</body>
</html>`;

// Save the directory page
fs.writeFileSync('./journal/index.html', directoryPage);
console.log('Execution Complete: All posts compiled and Journal Directory fully updated.');