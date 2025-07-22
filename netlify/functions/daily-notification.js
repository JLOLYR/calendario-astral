// netlify/functions/daily-notification.js
const fs = require('fs');
const path = require('path');

// Pega aquí la lógica COMPLETA de getDayClassification que ya tienes
function getDayClassification(dayData) { 
    if (!dayData) return null;
    const ICON_GIF_PATHS = { tension: 'assets/aspects/tension.gif', friction: 'assets/aspects/friccion.gif', harmonic: 'assets/aspects/armonico.gif', creative: 'assets/aspects/creativo.gif', change: 'assets/aspects/cambio.gif', revelation: 'assets/aspects/revelacion.gif' };
    const aspectCounts = { Trine: 0, Square: 0, Opposition: 0, Sextile: 0 };
    if (dayData.Aspects) { const processed = new Set(); for (const p1 in dayData.Aspects) { for (const p2 in dayData.Aspects[p1]) { const key = [p1, p2].sort().join('-'); if (processed.has(key)) continue; processed.add(key); const aspectType = dayData.Aspects[p1][p2].type; if (aspectCounts.hasOwnProperty(aspectType)) { aspectCounts[aspectType]++; } } } }
    const slowPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node', 'Chiron'];
    if (dayData.Aspects?.Sun) { for (const planet in dayData.Aspects.Sun) { if (slowPlanets.includes(planet) && dayData.Aspects.Sun[planet].type === 'Conjunction') { return { title: 'Día de Revelación', body: 'La energía ilumina un tema importante. ¡Presta atención!', iconPath: ICON_GIF_PATHS.revelation, colorClass: 'day-revelation' }; } } }
    if (aspectCounts.Square >= 2 && aspectCounts.Opposition >= 1) { return { title: 'Día de Tensión', body: 'La presión es alta. Actúa con paciencia y conciencia.', iconPath: ICON_GIF_PATHS.tension, colorClass: 'day-tension' }; }
    if (aspectCounts.Square >= 2 || aspectCounts.Opposition >= 2) { return { title: 'Día de Fricción', body: 'Pueden surgir roces y desafíos. ¡Una oportunidad para crecer!', iconPath: ICON_GIF_PATHS.friction, colorClass: 'day-friction' }; }
    if (aspectCounts.Trine >= 2 && aspectCounts.Square <= 1) { return { title: 'Día Armónico', body: 'La energía fluye con facilidad. Ideal para disfrutar y crear.', iconPath: ICON_GIF_PATHS.harmonic, colorClass: 'day-harmonic' }; }
    if (aspectCounts.Sextile >= 2 || (aspectCounts.Sextile >= 1 && aspectCounts.Trine >= 1)) { return { title: 'Día Creativo', body: 'Surgen oportunidades y nuevas ideas. ¡Toma la iniciativa!', iconPath: ICON_GIF_PATHS.creative, colorClass: 'day-creative' }; }
    const hasPlanetChange = dayData.Sign_Changes?.some(change => change.planet !== 'Moon');
    if (hasPlanetChange) { return { title: 'Día de Cambio', body: 'El tono energético se modifica. Adáptate a la nueva corriente.', iconPath: ICON_GIF_PATHS.change, colorClass: 'day-change' }; }
    return null;
}

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
        console.log("Datos del día obtenidos exitosamente:", JSON.stringify(dayData, null, 2));
    } catch (error) {
        console.error("Error al leer o parsear el archivo JSON:", error);
        return { statusCode: 500, body: "Error al leer datos." };
    }

    console.log("Clasificando el tipo de día...");
    const classification = getDayClassification(dayData);
    
    let notificationPayload = {};
    
    if (classification) {
        console.log(`Día clasificado como: ${classification.title}`);
        notificationPayload = classification;
    } else if (dayData.Eclipse) {
        console.log("Evento detectado: Eclipse");
        notificationPayload = { title: "¡Día de Eclipse! 🌑", body: "La energía es potente y transformadora." };
    } else if (dayData.Moon_Phase === "Luna Nueva") {
        console.log("Evento detectado: Luna Nueva");
        notificationPayload = { title: "¡Luna Nueva! 🌱", body: "Momento perfecto para plantar intenciones." };
    } else if (dayData.Moon_Phase === "Luna Llena") {
        console.log("Evento detectado: Luna Llena");
        notificationPayload = { title: "¡Luna Llena! 🌕", body: "Las emociones llegan a su clímax." };
    } else {
        console.log("No se encontró ninguna clasificación o evento especial. No se enviará notificación.");
        return { statusCode: 200, body: "No hay notificación para hoy." };
    }

    console.log(`Enviando notificación a OneSignal con el título: "${notificationPayload.title}"`);
    try {
        await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID,
                included_segments: ["Subscribed Users"],
                headings: { "en": notificationPayload.title },
                contents: { "en": notificationPayload.body },
                web_url: "https://TU_URL_DE_NETLIFY_AQUI/"
            })
        });
        console.log("Notificación enviada a OneSignal exitosamente.");
        return { statusCode: 200, body: "Notificación enviada." };
    } catch (error) {
        console.error("Error al enviar la notificación a OneSignal:", error);
        return { statusCode: 500, body: "Error al enviar notificación." };
    }
};