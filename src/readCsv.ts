import * as fs from 'fs';

export function readAvgHistory(): [number[], number[]] {

    // Read the CSV file contents as a string
    const csvContents = fs.readFileSync('files/avgHistory.csv', 'utf8');

    // Parse the CSV string into an array of objects
    const csvRows = csvContents.trim().split('\n').slice(1).map(row => {
        const [n_days_since_1st_may, hygro] = row.trim().split(',');
        return {
            n_days_since_1st_may: parseInt(n_days_since_1st_may),
            hygro: parseFloat(hygro),
        };
    });

    // Extract the n_days_since_1st_may and temperature columns into separate arrays
    const x = csvRows.map(row => row.n_days_since_1st_may);
    const y = csvRows.map(row => row.hygro);

    return [x, y];
}

export function readTmp(): (string | number)[][] {

    // Read the CSV file contents as a string
    const csvContents = fs.readFileSync('files/tmp.csv', 'utf8');


    // Parse the CSV string into an array of objects
    const csvRows = csvContents.trim().split('\n').slice(1).map(row => {
        const [timestamp, temperature, hygro] = row.trim().split(',');
        return {
            timestamp: timestamp.substring(11, 16),
            temperature: parseFloat(temperature),
            hygro: parseFloat(hygro)
        };
    });

    // Extract the n_days_since_1st_may and temperature columns into separate arrays
    return csvRows.map(row => [row.timestamp, row.temperature, row.hygro]);
}
