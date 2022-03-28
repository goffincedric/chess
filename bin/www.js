const express = require("express");

// Create express instance
const app = express();
// Serve static files
app.use((_, res, next) => {
    res.set("Cross-Origin-Opener-Policy", "same-origin");
    res.set("Cross-Origin-Embedder-Policy", "require-corp");
    next();
})
app.use(express.static('./public'));
app.use('/js', express.static('./dist'));
// Listen on port
app.listen(8080, () => {
    console.log('Listening on port 8080: http://localhost:8080');
})
