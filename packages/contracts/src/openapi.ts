/* eslint-env node */
import {writeFileSync} from 'fs';
import path from 'path';

// Placeholder simple OpenAPI document; extend in future phases
const document = {
  openapi: '3.0.0',
  info: {title: 'Aidvokat API', version: '0.1.0'},
  paths: {},
  components: {}
};

// eslint-disable-next-line no-undef
writeFileSync(path.join(__dirname, '../openapi.json'), JSON.stringify(document, null, 2));
