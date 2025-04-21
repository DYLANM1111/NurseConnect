const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: 'dylanmuroki',         
  database: 'nurseconnect',   
  host: 'localhost',          
  port: 5432,                  
  password: '', 
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for too long!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);
    
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    client.release = () => {
      // Clear the timeout
      clearTimeout(timeout);
      // Set the methods back to their old implementation
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};