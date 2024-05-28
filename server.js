const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const DIST_DIR = path.join(__dirname, 'dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
    res.sendFile(HTML_FILE);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
