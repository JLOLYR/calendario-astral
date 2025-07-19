// netlify/functions/daily-notification.js
const fs = require('fs');
const path = require('path');

// Pega aquí la lógica de getDayClassification que ya tienes
function getDayClassification(dayData) { /* ... tu lógica ... */ }

exports.handler = async function(event, context) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // 1. Leer el archivo JSON desde el repositorio
    const filePath = path.join(__dirname, `../../Calendar/${year}/astro_data_${year}_${String(month).padStart(2, '0')}.json`);
    let dayData;
    try {
        const file = fs.readFileSync(filePath, 'utf8');
        const monthlyData = JSON.parse(file);
        dayData = monthlyData[String(year)][String(month)][String(day)];
    } catch (error) {
        console.error("Error al leer el archivo JSON:", error);
        return { statusCode: 500, body: "Error al leer datos." };
    }

    if (!dayData) { return { statusCode: 200, body: "No hay datos para hoy." }; }

    // 2. Determinar el mensaje (misma lógica que antes)
    let notificationPayload = getDayClassification(dayData) || { /* ... lógica para eclipses, etc ... */ };
    if (!notificationPayload.title) { return { statusCode: 200, body: "No hay notificación para hoy." }; }

    // 3. Enviar la notificación usando la API de OneSignal
    await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            // ¡Usa tu propia API Key de OneSignal!
            'Authorization': `Basic TU_REST_API_KEY_DE_ONESIGNAL`
        },
        body: JSON.stringify({
            app_id: "TU_APP_ID_DE_ONESIGNAL",
            included_segments: ["Subscribed Users"], // Enviar a todos
            headings: { "en": notificationPayload.title },
            contents: { "en": notificationPayload.body },
            web_url: "https://tu-calendario.netlify.app/" // URL de tu app
        })
    });

    return {
        statusCode: 200,
        body: "Notificación enviada."
    };
};