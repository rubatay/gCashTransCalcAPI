const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const app = express();
const port = 5000;
const XlsxPopulate = require('xlsx-populate');
const { getExclusionLookupData, getTransactionTypeLookupData, getRatesData } = require('./modules/dbQueries'); // Import the queries module

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const cors = require('cors'); // Import cors

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve the uploaded files statically
app.use('/uploads', express.static('uploads'));

// Handle file upload
app.post('/upload', upload.single('xlsxFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const xlsxFile = req.file.buffer;

  try {
    // Read the uploaded XLSX file
    const workbook = XLSX.read(xlsxFile, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Fetch from the database
    const exclusionLookupData = await getExclusionLookupData();
    const transactionTypeLookupData = await getTransactionTypeLookupData();
    const ratesData = await getRatesData();

    // Calculate fees, update the data, and determine transaction type
    data.forEach((row) => {
      const debit = parseFloat(row.Debit) || 0;
      const credit = parseFloat(row.Credit) || 0;
      let isExclude = false;
      let multiplier = 0;
      let transType = '';
      let transTypeDesc = '';
      let rateFound = false;
      let rateFee = 0; 
      let currentRateFee = 0; 
      let prevRateFee = 0; 
    
      isExclude = false;
      multiplier = 0;
      rateFee = 0; 
      currentRateFee = 0; 
      prevRateFee = 0; 

      row['Transaction Type'] = '';
      row.Fee = 0;
    
      for (const lookup of exclusionLookupData) {
        if (row.Description.includes(lookup.LOOKUP_VALUE)) {
          isExclude = true;
          break;
        }
      }
    
      if (!isExclude) {
        // Loop through the transaction type lookup data to find a match
        for (const lookup of transactionTypeLookupData) {
          if (row.Description.includes(lookup.LOOKUP_VALUE)) {
            transType = lookup.TRANSACTION_TYPE_ID;
            transTypeDesc = lookup.TRANSACTION_TYPE_DESC;
            multiplier = lookup.MULTIPLIER;
            break;
          }
        }

        if (transType !== '') {
          row['Transaction Type'] = transTypeDesc;
    
          rateFound = false;
          for (const rate of ratesData) {
            if (transType === rate.TRANSACTION_TYPE_ID) {
              currentRateFee = rate.FEE;
              if (debit + credit < rate.AMOUNT) {
                rateFound = true;
                rateFee = prevRateFee;
                break;
              }
              prevRateFee = currentRateFee;
            }
          }
    
          if (rateFound === true) {
            row.Fee = rateFee * multiplier;
          } else {
            row.Fee = 0;
          }
        }
      } else {
        row.Fee = 0;
      }
    });

    // Create a new XLSX file manually with xlsx-populate
    const fileName = `transaction-fees-${Date.now()}.xlsx`;

    const newXlsx = await XlsxPopulate.fromBlankAsync();
    const newSheet = newXlsx.sheet(0);

    const headerRow = ['Date and Time', 'Description', 'Reference No.', 'Debit', 'Credit', 'Balance', 'Transaction Type', 'Fee'];
    headerRow.forEach((header, index) => {
      newSheet.cell(1, index + 1).value(header);
    });

    // Add data rows
    data.forEach((row, rowIndex) => {
      const rowData = [
        row['Date and Time'],
        row.Description,
        row['Reference No.'], // Use the correct column name
        row.Debit,
        row.Credit,
        row.Balance,
        row['Transaction Type'],
        row.Fee,
      ];
      rowData.forEach((value, columnIndex) => {
        newSheet.cell(rowIndex + 2, columnIndex + 1).value(value);
      });
    });

    // Save the new XLSX file
    await newXlsx.toFileAsync(`uploads/${fileName}`);

    const apiUrl = process.env.APP_API_URL 

    // Send the file download link to the client
    res.json({ downloadLink: `${apiUrl}/uploads/${fileName}` });

    // Delete the file from the uploads folder after a delay
    setTimeout(() => {
      fs.unlinkSync(`uploads/${fileName}`);
    }, 12000); // Delayed deletion (e.g., 12 seconds) to ensure the file is downloaded    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
