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
        // Crear fecha con zona horaria de Bogotá
        const date = new Date();
        const bogotaDate = new Intl.DateTimeFormat('es-CO', {
            timeZone: 'America/Bogota',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);

        // Formatear la fecha al formato deseado (DD/MM/YYYY HH:mm:ss)
        const formattedDate = bogotaDate
            .replace(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/, '$1/$2/$3 $4:$5:$6');

        let auth;
        
        if (process.env.GOOGLE_CREDENTIALS) {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
        } else {
            auth = new google.auth.GoogleAuth({
                keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
        }

        const authClient = await auth.getClient();
        const spreadsheetId = '1ZBU7NZtPPxW3bYBj0xwPcPWKsQL2buXPCRq9axJrY60'

        // Reorganizar los datos en el orden correcto
        const valuesWithDate = [
            data.phone,           // Número de WhatsApp
            data.name,            // Nombre
            data.petName,         // Nombre de la mascota
            data.service,         // Tipo de servicio
            data.status,          // En consulta
            formattedDate         // Fecha y hora
        ];

        await addRowTosheet(authClient, spreadsheetId, valuesWithDate);
        return 'Datos correctamente agregados'
    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;