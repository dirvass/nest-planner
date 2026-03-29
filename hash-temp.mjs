import { createHash } from 'crypto';
console.log(createHash('sha256').update('verde2026').digest('hex'));
