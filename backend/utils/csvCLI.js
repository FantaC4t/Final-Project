#!/usr/bin/env node
const { program } = require('commander');
const { processAllCSVFiles, processCSVFile } = require('./csvProcessor');
const { importCSVDataToMongoDB } = require('./csvImporter');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

program
  .version('1.0.0')
  .description('CSV Data Processing Tool for PCBuilder');

// Command to process all CSV files
program
  .command('process-all')
  .description('Process all CSV files in the csv directory')
  .action(async () => {
    try {
      await processAllCSVFiles();
    } catch (error) {
      console.error('❌ Error processing CSV files:', error);
    }
  });

// Command to process a specific CSV file
program
  .command('process <filename>')
  .description('Process a specific CSV file')
  .option('-c, --category <category>', 'Override category detection')
  .action(async (filename, options) => {
    try {
      const csvDirectory = path.join(__dirname, '..', 'csv');
      const filePath = path.join(csvDirectory, filename.endsWith('.csv') ? filename : `${filename}.csv`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
      }
      
      const outputDirectory = path.join(__dirname, '..', 'data', 'transformed');
      fs.mkdirSync(outputDirectory, { recursive: true });
      
      const category = options.category || getCategoryFromFilename(path.basename(filename, '.csv'));
      console.log(`🔄 Processing ${filename} as ${category}...`);
      
      const transformedData = await processCSVFile(filePath, category);
      
      const outputPath = path.join(outputDirectory, `${path.basename(filename, '.csv')}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
      
      console.log(`✅ Saved ${transformedData.length} transformed items to ${outputPath}`);
    } catch (error) {
      console.error('❌ Error processing file:', error);
    }
  });

// Command to import transformed data
program
  .command('import')
  .description('Import transformed CSV data to MongoDB')
  .action(async () => {
    try {
      await importCSVDataToMongoDB();
    } catch (error) {
      console.error('❌ Error importing data:', error);
    }
  });

// Command for full process
program
  .command('full-process')
  .description('Process all CSV files and import to MongoDB')
  .action(async () => {
    try {
      console.log('📊 Starting full CSV processing workflow...');
      
      // Step 1: Process CSVs
      console.log('\n🔄 Step 1: Processing CSV files...');
      await processAllCSVFiles();
      
      // Step 2: Import to MongoDB
      console.log('\n🔄 Step 2: Importing to MongoDB...');
      await importCSVDataToMongoDB();
      
      console.log('\n🎉 Full process completed successfully!');
    } catch (error) {
      console.error('❌ Error during full process:', error);
    }
  });

// Helper to determine category from filename
function getCategoryFromFilename(filename) {
  const categoryMap = {
    'cpu': 'Processors',
    'processor': 'Processors',
    'gpu': 'Graphics Cards',
    'graphics': 'Graphics Cards',
    'motherboard': 'Motherboards',
    'memory': 'Memory',
    'ram': 'Memory',
    'storage': 'Storage',
    'ssd': 'Storage',
    'hdd': 'Storage',
    'psu': 'Power Supplies',
    'power': 'Power Supplies',
    'case': 'Cases',
    'cooling': 'Cooling',
    'cooler': 'Cooling'
  };
  
  const lowerFilename = filename.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerFilename.includes(key)) {
      return value;
    }
  }
  
  return 'Uncategorized';
}

program.parse(process.argv);