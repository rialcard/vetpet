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
        // Log inicial para ver qué datos llegan
        console.log('Datos recibidos en appendToSheet:', {
            dataRecibida: data,
            tipoData: typeof data,
            esNull: data === null,
            esUndefined: data === undefined
        });

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

        // Verificar y asignar valores por defecto si es necesario
        const phoneNumber = data.phone || 'No especificado';
        const customerName = data.name || 'No especificado';
        const petName = data.petName || 'No especificado';
        // Modificar esta línea para usar el service como estado
        const serviceType = data.service || 'No especificado';
        const consultationStatus = serviceType; // Usar el tipo de servicio como estado

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

        // Asegurarnos de que todos los datos estén presentes y en el orden correcto
        const valuesWithDate = [
            phoneNumber,          // Número de WhatsApp
            customerName,         // Nombre del cliente
            petName,             // Nombre de la mascota
            serviceType,         // Tipo de servicio
            consultationStatus,   // Estado de la consulta (ahora será igual al servicio)
            formattedDate        // Fecha y hora
        ];

        // Verificar que tenemos todos los datos antes de enviar
        console.log('Datos a enviar:', valuesWithDate);

        await addRowTosheet(authClient, spreadsheetId, valuesWithDate);
        return 'Datos correctamente agregados'
    } catch (error) {
        console.error('Error al agregar datos:', error);
        throw error; // Propagar el error para mejor manejo
    }
    // Log antes de procesar
    console.log('Datos procesados:', {
        phoneNumber,
        customerName,
        petName,
        serviceType,
        consultationStatus
    });
}

export default appendToSheet;