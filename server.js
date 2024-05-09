const express = require('express');
require('dotenv').config({ path: './.env.development' });

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
