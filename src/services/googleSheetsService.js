import path from 'path';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function addRowTosheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }

    try {
        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;
    } catch (error) {
        console.error(error)
    }
}

const appendToSheet = async (data) => {
    try {
        let auth;
        
        // Usar credenciales desde variable de entorno si estamos en producción
        if (process.env.GOOGLE_CREDENTIALS) {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
        } else {
            // Fallback a archivo local para desarrollo
            auth = new google.auth.GoogleAuth({
                keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
        }

        const authClient = await auth.getClient();
        const spreadsheetId = '1ZBU7NZtPPxW3bYBj0xwPcPWKsQL2buXPCRq9axJrY60'

        await addRowTosheet(authClient, spreadsheetId, data);
        return 'Datos correctamente agregados'
    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;