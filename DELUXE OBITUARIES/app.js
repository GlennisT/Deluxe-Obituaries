const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'obituary_platform'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Route to view obituaries
app.get('/view_obituaries', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM obituaries ORDER BY submission_date DESC LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            res.send('Error retrieving obituaries');
            return;
        }

        const metaTags = results.map(obituary => `
            <meta name="description" content="${obituary.content.slice(0, 150)}">
            <meta name="keywords" content="${obituary.name}, obituary, ${obituary.author}">
            <link rel="canonical" href="http://localhost:3000/view_obituaries?page=${page}">
            <meta property="og:title" content="${obituary.name}">
            <meta property="og:description" content="${obituary.content.slice(0, 150)}">
            <meta property="og:image" content="URL_to_image_if_available">
            <meta property="og:url" content="http://localhost:3000/view_obituaries?page=${page}">
            <meta property="og:type" content="article">
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Obituaries List</title>
                <meta name="description" content="View obituaries on our platform.">
                <meta name="keywords" content="obituaries, death notices, memorials">
                ${metaTags}
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <div class="container">
                    <h1>Obituaries</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date of Birth</th>
                                <th>Date of Death</th>
                                <th>Content</th>
                                <th>Author</th>
                                <th>Submission Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(obituary => `
                                <tr>
                                    <td>${obituary.name}</td>
                                    <td>${obituary.date_of_birth}</td>
                                    <td>${obituary.date_of_death}</td>
                                    <td>${obituary.content}</td>
                                    <td>${obituary.author}</td>
                                    <td>${obituary.submission_date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="pagination">
                        ${page > 1 ? `<a href="/view_obituaries?page=${page - 1}">Previous</a>` : ''}
                        <span>Page ${page}</span>
                        <a href="/view_obituaries?page=${page + 1}">Next</a>
                    </div>
                    <div class="social-share">
                        <a href="https://twitter.com/share?url=http://localhost:3000/view_obituaries&page=${page}&text=Check out these obituaries" target="_blank">Share on Twitter</a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=http://localhost:3000/view_obituaries&page=${page}" target="_blank">Share on Facebook</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
