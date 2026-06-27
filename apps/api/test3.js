const express = require('express');
const app = express();
const server = app.listen(3000, () => {
  console.log('✓ Athelya API running on http://localhost:3000');
});
console.log('Server unref:', server.unref === undefined);
