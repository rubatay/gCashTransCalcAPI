const db = require('./db'); // Import the database connection from db.js

// Function to call the stored procedure and retrieve exclusions
async function getExclusionLookupData() {
  try {
    const result = await db.func('DBF_GCTRANSCALC_GET_EXCLUSION');
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database error');
  }
}

// Function to call the stored procedure 
async function getTransactionTypeLookupData() {
    try {
      const result = await db.func('DBF_GCTRANSCALC_GET_TRANS_LOOKUP_DATA');
      return result;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Database error');
    }
  }

// Function to call the stored procedure 
async function getRatesData() {
    try {
      const result = await db.func('DBF_GCTRANSCALC_GET_RATES');
      return result;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Database error');
    }
  }  

module.exports = {
    getExclusionLookupData, getTransactionTypeLookupData, getRatesData
};
