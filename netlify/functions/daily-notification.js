// netlify/functions/daily-notification.js (VERSIÓN FINAL Y CORREGIDA)

const fs = require('fs');
const path = require('path');

// =========================================================================
// == FUNCIÓN DE CLASIFICACIÓN (MÁS ROBUSTA Y CON BODY DEL MENSAJE) ==
// =========================================================================
function getDayClassification(dayData) {
    if (!dayData) return null;
    
    // --- 1. Contar aspectos de forma segura ---
    const aspectCounts = { Trine: 0, Square: 0, Opposition: 0, Sextile: 0 };
    if (dayData.Aspects && typeof dayData.Aspects === 'object') {
        const processed = new Set();
        for (const p1 in dayData.Aspects) {
            for (const p2 in dayData.Aspects[p1]) {
                const key = [p1, p2].sort().join("-");
                if (processed.has(key)) continue;
                processed.add(key);
                const aspectType = dayData.Aspects[p1][p2].type;
                if (aspectCounts.hasOwnProperty(aspectType)) aspectCounts[aspectType]++;
            }
        }
    }
    console.log("Recuento de aspectos:", aspectCounts); // Log para depurar

    // --- 2. Revisar las condiciones y devolver un objeto COMPLETO ---
    const slowPlanets = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "North Node", "South Node"];
    if (dayData.Aspects && dayData.Aspects.Sun) {
        for (const planet in dayData.Aspects.Sun) {
            if (slowPlanets.includes(planet) && dayData.Aspects.Sun[planet].type === "Conjunction") {
                return { title: "Día de Revelación 🔍", body: "La energía ilumina un tema importante. ¡Presta atención!" };
            }
        }
    }

    if (aspectCounts.Square >= 4 || aspectCounts.Opposition >= 4) {
        return { title: "Día de Tensión ⚡", body: "La presión es alta. Actúa con paciencia y conciencia." };
    }
    if (aspectCounts.Square >= 2 || aspectCounts.Opposition >= 2) {
        return { title: "Día de Fricción 🔥", body: "Pueden surgir roces y desafíos. ¡Una oportunidad para crecer!" };
    }
    if (aspectCounts.Trine >= 2 && aspectCounts.Square <= 1) {
        return { title: "Día Armónico 💫", body: "La energía fluye con facilidad. Ideal para disfrutar y crear." };
    }
    if (aspectCounts.Sextile >= 2 || (aspectCounts.Sextile >= 1 && aspectCounts.Trine >= 1)) {
        return { title: "Día Creativo ✨", body: "Surgen oportunidades y nuevas ideas. ¡Toma la iniciativa!" };
    }
    
    // Comprobación segura para cambios de signo
    if (dayData.Sign_Changes && Array.isArray(dayData.Sign_Changes) && dayData.Sign_Changes.some(c => c.planet !== "Moon")) {
        return { title: "Día de Cambio 🔄", body: "El tono energético se modifica. Adáptate a la nueva corriente." };
    }

    return null; // Si no se cumple ninguna condición
}


// =================================================================================
// ===              HANDLER PRINCIPAL (MÁS ROBUSTO Y CON LOGS)                   ===
// =================================================================================
exports.handler = async function(event, context) {
    console.log("--- INICIANDO EJECUCIÓN DE FUNCIÓN DIARIA ---");

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    console.log(`Fecha de hoy: ${year}-${month}-${day}`);

    // La ruta se construye subiendo de nivel desde la ubicación de la función
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
    
    // Si no hay clasificación especial, revisamos eventos lunares
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

    // Si después de todas las comprobaciones no hay nada que notificar, terminamos.
    if (!notificationPayload || !notificationPayload.title) {
        console.log("No se encontró ninguna clasificación o evento especial. No se enviará notificación.");
        return { statusCode: 200, body: "No hay notificación para hoy." };
    }

    console.log(`Enviando notificación a OneSignal con el título: "${notificationPayload.title}"`);
    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
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