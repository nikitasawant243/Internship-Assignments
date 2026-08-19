/**
 * Database Deployment Script
 * This script deploys the database schema and loads initial data
 */

const cds = require('@sap/cds');

async function deployDatabase() {
    try {
        console.log('Starting database deployment...');
        
        // Connect to database
        const db = await cds.connect.to('db');
        
        console.log('Database connected successfully');
        console.log('Deploying schema...');
        
        // Deploy will create tables and load CSV data
        await cds.deploy('db').to('sqlite:db.sqlite');
        
        console.log('✅ Database deployment completed successfully!');
        console.log('✅ Tables created');
        console.log('✅ Sample data loaded');
        console.log('\nYou can now run: cds watch');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database deployment failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure you have @cap-js/sqlite installed');
        console.error('2. Try running: npm install');
        console.error('3. If using SAP BAS, the database will be created automatically on first run');
        process.exit(1);
    }
}

deployDatabase();

// Made with Bob
