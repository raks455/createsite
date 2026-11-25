'use strict';
require('./src/main').start().catch((err) => {
  console.error(err);
  process.exit(1);
});
