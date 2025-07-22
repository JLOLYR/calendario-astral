// netlify/functions/daily-notification.js

// ... (la función getDayClassification no cambia) ...

// =================================================================================
// ===              HANDLER PRINCIPAL (CON VERIFICACIÓN DE CLAVES)               ===
// =================================================================================
exports.handler = async function(event, context) {
    console.log("--- INICIANDO EJECUCIÓN DE FUNCIÓN DIARIA ---");

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    console.log(`Fecha de hoy: ${year}-${month}-${day}`);

    const filePath = path.join(__dirname, "..", "..", "Calendar", String(year), `astro_data_${year}_${String(month).padStart(2, "0")}.json`);
    console.log(`Intentando leer el archivo: ${filePath}`);
    
    let dayData;
    try {
        const file = fs.readFileSync(filePath, 'utf8');
        const monthlyData = JSON.parse(file);
        dayData = monthlyData[String(year)][String(month)][String(day)];
        if (!dayData) {
            console.log(`Archivo leído, pero no se encontraron datos para el día ${day}.`);
            return { statusCode: 200, body: "No hay datos para hoy." };
        }
        console.log("Datos del día obtenidos exitosamente.");
    } catch (error) {
        console.error("Error al leer o parsear el archivo JSON:", error);
        return { statusCode: 500, body: "Error al leer datos." };
    }

    console.log("Clasificando el tipo de día...");
    let notificationPayload = getDayClassification(dayData);
    
    if (!notificationPayload) {
        if (dayData.Eclipse) {
            console.log("Evento detectado: Eclipse");
            notificationPayload = { title: "¡Día de Eclipse! 🌑", body: "La energía es potente y transformadora. Observa y siente." };
        } else if (dayData.Moon_Phase === "Luna Nueva") {
            console.log("Evento detectado: Luna Nueva");
            notificationPayload = { title: "¡Luna Nueva! 🌱", body: "Momento perfecto para plantar intenciones." };
        } else if (dayData.Moon_Phase === "Luna Llena") {
            console.log("Evento detectado: Luna Llena");
            notificationPayload = { title: "¡Luna Llena! 🌕", body: "Las emociones llegan a su clímax." };
        }
    }

    if (!notificationPayload || !notificationPayload.title) {
        console.log("No se encontró ninguna clasificación o evento especial. No se enviará notificación.");
        return { statusCode: 200, body: "No hay notificación para hoy." };
    }

    console.log(`Enviando notificación a OneSignal con el título: "${notificationPayload.title}"`);

    // --- NUEVO BLOQUE DE VERIFICACIÓN ---
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        console.error("¡ERROR CRÍTICO! Las variables de entorno ONESIGNAL_APP_ID o ONESIGNAL_REST_API_KEY no están definidas en Netlify.");
        return { statusCode: 500, body: "Variables de entorno no configuradas." };
    }
    console.log(`App ID encontrado: ${appId.substring(0, 4)}... (verificado)`);
    // --- FIN DEL BLOQUE DE VERIFICACIÓN ---

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${apiKey}`
            },
            body: JSON.stringify({
                app_id: appId,
                included_segments: ["Subscribed Users"],
                headings: { "en": notificationPayload.title },
                contents: { "en": notificationPayload.body },
                web_url: "https://calm-cactus-1f88bf.netlify.app/" // Reemplaza con tu URL real
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la respuesta de OneSignal:", errorData);
            return { statusCode: response.status, body: JSON.stringify(errorData) };
        }

        const responseData = await response.json();
        console.log("Notificación enviada a OneSignal exitosamente:", responseData);
        return { statusCode: 200, body: "Notificación enviada." };

    } catch (error) {
        console.error("Error de red al enviar la notificación a OneSignal:", error);
        return { statusCode: 500, body: "Error al enviar notificación." };
    }
};