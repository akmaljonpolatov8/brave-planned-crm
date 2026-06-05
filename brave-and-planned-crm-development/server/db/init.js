import { initializeDatabase, closeDatabase } from './database.js';

console.log('Initializing database...');
initializeDatabase();
closeDatabase();
console.log('✅ Database initialized successfully');
