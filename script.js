document.addEventListener('DOMContentLoaded', () => {

    const db = firebase.firestore();
    const messaging = firebase.messaging();
    
    // =========================================================================
    // ==                      CONSTANTES Y VARIABLES GLOBALES                ==
    // =========================================================================
    const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const FASES_LUNARES_PRINCIPALES = ['Luna Nueva', 'Cuarto Creciente', 'Luna Llena', 'Cuarto Menguante'];
    const ASPECT_COLORS = { Conjunction: 'dot-conjunction', Opposition: 'dot-opposition', Square: 'dot-square', Trine: 'dot-trine', Sextile: 'dot-sextile' };

    const ICON_PATHS = {
        planets: { 'Sun': 'assets/planets/Sun.png', 'Moon': 'assets/planets/Moon.png', 'Mercury': 'assets/planets/Mercury.png', 'Venus': 'assets/planets/Venus.png', 'Mars': 'assets/planets/Mars.png', 'Jupiter': 'assets/planets/Jupiter.png', 'Saturn': 'assets/planets/Saturn.png', 'Uranus': 'assets/planets/Uranus.png', 'Neptune': 'assets/planets/Neptune.png', 'Pluto': 'assets/planets/Pluto.png', 'Chiron': 'assets/planets/Chiron.png', 'North Node': 'assets/planets/North_Node.png','South Node': 'assets/planets/South_Node.png', 'Darkmoon': 'assets/planets/Dark_Moon.png', 'Pars Fortuna': 'assets/planets/Pars_Fortuna.png' },
        signs: { 'Aries': 'assets/signs/Aries.png', 'Taurus': 'assets/signs/Taurus.png', 'Gemini': 'assets/signs/Gemini.png', 'Cancer': 'assets/signs/Cancer.png', 'Leo': 'assets/signs/Leo.png', 'Virgo': 'assets/signs/Virgo.png', 'Libra': 'assets/signs/Libra.png', 'Scorpio': 'assets/signs/Scorpio.png', 'Sagittarius': 'assets/signs/Sagittarius.png', 'Capricorn': 'assets/signs/Capricorn.png', 'Aquarius': 'assets/signs/Aquarius.png', 'Pisces': 'assets/signs/Pisces.png' },
        aspects: { 'Conjunction': 'assets/aspects/Conjunction.png', 'Opposition': 'assets/aspects/Opposition.png', 'Trine': 'assets/aspects/Trine.png', 'Square': 'assets/aspects/Square.png', 'Sextile': 'assets/aspects/Sextile.png', 'Retrograde': 'assets/aspects/Retrograde.png' },
        events: {'Luna Nueva': 'assets/aspects/luna_nueva.gif','Cuarto Creciente': 'assets/aspects/luna_cuarto.gif','Luna Llena': 'assets/aspects/luna_llena.gif','Cuarto Menguante': 'assets/aspects/luna_cuarto.gif','Eclipse Lunar Total': 'assets/aspects/Eclipse Lunar Total.png','Eclipse Solar Total': 'assets/aspects/Eclipse Solar Total.png','Eclipse Lunar Partial': 'assets/aspects/Eclipse Lunar Parcial.png','Eclipse Solar Partial': 'assets/aspects/Eclipse Solar Parcial.png','Eclipse Lunar Anular': 'assets/aspects/Eclipse Lunar Anular.png','Eclipse Solar Anular': 'assets/aspects/Eclipse Solar Anular.png'},
        alerts: { 'Warning': 'assets/aspects/warning.gif' },
        special_days: {
            'Día Amoroso': 'assets/aspects/amor.gif',
            'Día Suertudo': 'assets/aspects/trebol.gif',
            'Día de Mala Suerte': 'assets/aspects/diablo.gif'
        }
    };

    const PERSONAL_EVENT_TYPES = {
        cumpleanos: { name: '🎂 Cumpleaños', icon: 'assets/aspects/cumpleanos.gif' },
        reunion:    { name: '🕒 Reunión',    icon: 'assets/aspects/reunion.gif' },
        contrato:   { name: '✍️ Contrato',   icon: 'assets/aspects/firma.gif' },
        examen:     { name: '📝 Examen',     icon: 'assets/aspects/prueba.gif' },
        cita:       { name: '❤️ Cita',       icon: 'assets/aspects/cita.gif' },
        medico:     { name: '⚕️ Médico',      icon: 'assets/aspects/medico.gif' },
        viaje:      { name: '✈️ Viaje',       icon: 'assets/aspects/viaje.gif' },
        fiesta:     { name: '🕺 Fiesta',     icon: 'assets/aspects/boladisco.gif' },
        evento:     { name: '✨ Otro Evento',  icon: 'assets/aspects/evento.gif' }
    };
    
    // --- Elementos del DOM ---
    const calendarContainer = document.getElementById('calendar-container');
    const calendarTitle = document.querySelector('#calendar-header h1');
    const selectMonth = document.getElementById('select-month');
    const selectYear = document.getElementById('select-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const printBtn = document.getElementById('print-btn');
    const downloadBtn = document.getElementById('download-btn');
    const symbolBtn = document.getElementById('symbol-btn');
    const mobileContainer = document.getElementById('mobile-view-container');
    const mobileDayContent = document.getElementById('mobile-day-content');
    const prevDayMobileBtn = document.getElementById('prev-day-mobile');
    const nextDayMobileBtn = document.getElementById('next-day-mobile');
    const symbolBtnMobile = document.getElementById('symbol-btn-mobile');
    const goToTodayBtn = document.getElementById('go-to-today-btn');
    const showAspectsBtn = document.getElementById('show-aspects-btn');
    const backToLandingBtn = document.getElementById('back-to-landing-btn');
    const mobileLandingContainer = document.getElementById('mobile-landing-container');
    const landingMonthYear = document.getElementById('landing-month-year');
    const landingCalendarGrid = document.getElementById('landing-calendar-grid');
    const landingDayDetails = document.getElementById('landing-day-details');
    const landingMenuBtn = document.getElementById('landing-menu-btn');
    const landingMenuDropdown = document.getElementById('landing-menu-dropdown');
    const landingSymbolBtn = document.getElementById('landing-symbol-btn');
    const landingInfoBtn = document.getElementById('landing-info-btn');
    const landingDownloadBtn = document.getElementById('landing-download-btn');
    const landingTodayBtn = document.getElementById('landing-today-btn');
    const modalBackBtn = document.getElementById('modal-back-btn');
    const installHelpBtn = document.getElementById('install-help-btn');
    const enableNotificationsBtn = document.getElementById('enable-notifications-btn');
    const modalAddEvent = document.getElementById('modal-add-event');
    const eventTypeSelector = document.getElementById('event-type-selector');
    const eventNameInput = document.getElementById('event-name-input');
    const eventDateInput = document.getElementById('event-date-input');
    const saveEventBtn = document.getElementById('save-event-btn');
    const cancelEventBtn = document.getElementById('cancel-event-btn');
    const landingAboutBtn = document.getElementById('landing-about-btn');
    const mobileActionBar = document.getElementById('mobile-action-bar');
    const actionInterpretBtn = document.getElementById('action-interpret');
    const actionInfoBtn = document.getElementById('action-info');
    const actionAddBtn = document.getElementById('action-add');

    // --- Estado de la aplicación ---
    let selectedYear, selectedMonth;
    let mobileDate = new Date();
    let landingDate = new Date();
    let selectedDayCell = null;
    let currentDetailDate = null;
    let activeModal = null;
    const MIN_YEAR = 2020;
    const MAX_YEAR = 2030;
    const dataCache = {};

    // =========================================================================
    // ==             *** GESTOR CENTRAL DE MODALES ***                       ==
    // =========================================================================

    // Función para CERRAR cualquier modal que esté activo
    function closeActiveModal() {
        if (activeModal) {
            activeModal.style.display = 'none';
            if (mobileContainer.style.display !== 'flex') {
                backToLandingBtn.style.display = 'none';
            }
            activeModal = null;
        }
    }

    function openModal(modal) {
        if (!modal) return;
        activeModal = modal;
        modal.style.display = 'flex';
        backToLandingBtn.style.display = 'flex';
        
        modal.querySelector('.close-button').onclick = closeActiveModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeActiveModal();
        };
    }

    // Función para ABRIR un modal y configurar su cierre
    function openModal(modal) {
        if (!modal) return; // Seguridad para evitar errores
        activeModal = modal;
        modal.style.display = 'flex';
        backToLandingBtn.style.display = 'flex'; // Siempre muestra el botón flotante
        
        // Configura la 'X' y el fondo para que usen el cierre centralizado
        modal.querySelector('.close-button').onclick = closeActiveModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeActiveModal();
        };
    }

    // =========================================================================
    // ==                     FUNCIONES AUXILIARES Y COMPARTIDAS              ==
    // =========================================================================
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const countEvents = (data) => {
        let count = 0;
        if (!data) return 0;
        if (data.Sign_Changes) {
            count += data.Sign_Changes.filter(c => c.planet !== 'Moon').length;
        }
        if (data.Retrograde_Changes) count += data.Retrograde_Changes.length;
        if (data.Aspects) {
            const processed = new Set();
            for (const p1 in data.Aspects) {
                for (const p2 in data.Aspects[p1]) {
                    const key = [p1, p2].sort().join('-');
                    if (processed.has(key)) continue;
                    processed.add(key);
                    count++;
                }
            }
        }
        return count;
    };
    
    const isHoliday = (date, festivosDelMes) => festivosDelMes.includes(date.getDate());

    const downloadCalendarImage = () => {
        let elementToCapture;
        let fileName;
        if (window.getComputedStyle(mobileLandingContainer).display === 'flex') {
            elementToCapture = landingCalendarGrid;
            const currentMonthName = NOMBRES_MESES[landingDate.getMonth()];
            const currentYear = landingDate.getFullYear();
            fileName = `Calendario-Astral-Movil-${currentMonthName}-${currentYear}.png`;
        } else {
            elementToCapture = calendarContainer;
            const currentMonthName = NOMBRES_MESES[selectedMonth - 1];
            fileName = `Calendario-Astral-${currentMonthName}-${selectedYear}.png`;
        }
        const options = { backgroundColor: "#fdfaf5", scale: 2 };
        html2canvas(elementToCapture, options).then(canvas => {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };
    
    const createEventRow = (items, aspectType = null) => {
        const row = document.createElement('div');
        row.classList.add('event-row');
        if (aspectType && ASPECT_COLORS[aspectType]) {
            const dot = document.createElement('span');
            dot.classList.add('aspect-dot', ASPECT_COLORS[aspectType]);
            row.appendChild(dot);
        }
        items.forEach(item => {
            if (item.type === 'text') {
                const span = document.createElement('span');
                span.textContent = item.value;
                span.classList.add('event-arrow');
                row.appendChild(span);
            } else {
                const path = ICON_PATHS[item.category]?.[item.name];
                if (path) {
                    const img = document.createElement('img');
                    img.src = path;
                    img.alt = item.name;
                    img.dataset.symbolName = item.name;
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', (event) => {
                        event.stopPropagation();
                        const symbolName = event.target.dataset.symbolName;
                        if (symbolName) showAndScrollToSymbol(symbolName);
                    });
                    img.classList.add(item.isSmall ? 'sign-icon-small' : `${item.category}-icon`);
                    row.appendChild(img);
                }
            }
        });
        return row;
    };

    const addEventsToCell = (container, dayData) => {
        if (!dayData) return;
        if (dayData.Moon) {
            const showsArrow = dayData.Moon.includes('CHANGE');
            const moonSign = dayData.Moon.replace('CHANGE ', '');
            let eventItems = showsArrow ? [{ category: 'planets', name: 'Moon' }, { type: 'text', value: '→' }, { category: 'signs', name: moonSign }] : [{ category: 'planets', name: 'Moon' }, { category: 'signs', name: moonSign }];
            container.appendChild(createEventRow(eventItems));
        }
        if (dayData.Retrograde_Changes?.length > 0) {
            dayData.Retrograde_Changes.forEach(change => {
                let eventItems = [];
                if (change.status === 'retrograde') eventItems = [{ category: 'planets', name: change.planet }, { type: 'text', value: '→' }, { category: 'aspects', name: 'Retrograde' }];
                else if (change.status === 'direct') eventItems = [{ category: 'aspects', name: 'Retrograde' }, { type: 'text', value: '→' }, { category: 'planets', name: change.planet }];
                if (eventItems.length > 0) container.appendChild(createEventRow(eventItems));
            });
        }
        if (dayData.Sign_Changes?.length > 0) {
            dayData.Sign_Changes.forEach(change => {
                if (change.planet === 'Moon') return;
                const eventItems = [{ category: 'planets', name: change.planet }, { type: 'text', value: '→' }, { category: 'signs', name: change.to }];
                container.appendChild(createEventRow(eventItems));
            });
        }
        if (dayData.Aspects) {
            const processed = new Set();
            for (const p1 in dayData.Aspects) {
                for (const p2 in dayData.Aspects[p1]) {
                    const aspectData = dayData.Aspects[p1][p2];
                    const key = [p1, p2].sort().join('-');
                    if (processed.has(key)) continue;
                    processed.add(key);
                    container.appendChild(createEventRow([{ category: 'planets', name: p1 }, { category: 'signs', name: aspectData.planet1_sign, isSmall: true }, { category: 'aspects', name: aspectData.type }, { category: 'planets', name: p2 }, { category: 'signs', name: aspectData.planet2_sign, isSmall: true }], aspectData.type));
                }
            }
        }
    };
    
    // FUNCIONES PARA MANEJAR EVENTOS PERSONALES (localStorage)
    function getPersonalEvents() {
        const events = localStorage.getItem('personalCalendarEvents');
        return events ? JSON.parse(events) : {};
    }

    function savePersonalEvents(events) {
        localStorage.setItem('personalCalendarEvents', JSON.stringify(events));
    }

    function addPersonalEvent(date, eventData) {
        // 1. Guardar en el almacenamiento local (como antes)
        const allEvents = getPersonalEvents();
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!allEvents[dateKey]) {
            allEvents[dateKey] = [];
        }
        
        allEvents[dateKey].push(eventData);
        savePersonalEvents(allEvents);

        // 2. NUEVO: Si el evento tiene hora, guardarlo en Firestore para el recordatorio
        if (eventData.time && eventData.time !== 'Todo el día') {
            messaging.getToken().then(token => {
                if (token) {
                    const [hour, minute] = eventData.time.split(':');
                    const eventDate = new Date(date);
                    eventDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

                    db.collection('personalEvents').add({
                        userToken: token,
                        eventName: eventData.name,
                        eventTimestamp: firebase.firestore.Timestamp.fromDate(eventDate)
                    }).then(() => {
                        console.log('Evento personal con recordatorio guardado en Firestore.');
                    });
                }
            }).catch(err => {
                console.error('No se pudo obtener el token para guardar el evento, el recordatorio no se enviará.', err);
            });
        }
    }
        
    function deletePersonalEvent(date, eventIndex) {

        const allEvents = getPersonalEvents();
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (allEvents[dateKey] && allEvents[dateKey][eventIndex]) {
            // Elimina el evento del array de ese día
            allEvents[dateKey].splice(eventIndex, 1);

            // Si ya no quedan eventos ese día, elimina la entrada del día completo
            if (allEvents[dateKey].length === 0) {
                delete allEvents[dateKey];
            }

            savePersonalEvents(allEvents);
            renderLandingView(landingDate); // Refresca la vista para mostrar los cambios
        }
    }

    function requestNotificationPermission() {
        console.log('Solicitando permiso para notificaciones...');
        messaging.requestPermission()
            .then(() => {
                console.log('Permiso de notificación concedido.');
                return messaging.getToken();
            })
            .then(token => {
                if (token) {
                    console.log('Token de FCM obtenido:', token);
                    // Guardamos el token en nuestra base de datos Firestore
                    return db.collection('fcmTokens').doc(token).set({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    alert('No se pudo obtener el token de notificación. Por favor, revisa los permisos de tu navegador.');
                }
            })
            .then(() => {
                alert('¡Notificaciones activadas con éxito! Recibirás un aviso diario a las 9 AM.');
            })
            .catch(err => {
                console.error('Error al activar las notificaciones: ', err);
                alert('Hubo un error al activar las notificaciones. Es posible que las hayas bloqueado previamente.');
            });
    }


    // =========================================================================
    // ==                         LÓGICA DE DATOS                             ==
    // =========================================================================
    async function getMonthlyData(year, month) {
        const cacheKey = `${year}-${month}`;
        if (dataCache[cacheKey]) return dataCache[cacheKey];
        const yearStr = year.toString();
        const monthStr = month.toString().padStart(2, '0');
        try {
            const [astroRes, festivosRes, textoRes] = await Promise.all([
                fetch(`Calendar/${yearStr}/astro_data_${yearStr}_${monthStr}.json`).then(res => res.ok ? res.json() : null),
                fetch(`Calendar/holidays.json`).then(res => res.ok ? res.json() : {}),
                fetch(`Calendar/${yearStr}/texto_${yearStr}_${monthStr}.json`).then(res => res.ok ? res.json() : null)
            ]);
            if (!astroRes) { console.warn(`No se encontraron datos astrales para ${monthStr}/${yearStr}`); return null; }
            const result = { astro: astroRes?.[year]?.[month] || {}, textos: textoRes?.[year]?.[month] || {}, festivos: festivosRes?.[year]?.[month] || [] };
            dataCache[cacheKey] = result;
            return result;
        } catch (error) {
            console.error(`Error cargando datos para ${monthStr}/${yearStr}:`, error);
            return null;
        }
    }

    // =========================================================================
    // ==                    LÓGICA VISTA ESCRITORIO (GRID)                   ==
    // =========================================================================
    function initDesktopView() {
        if (!calendarContainer) return;
        const now = new Date();
        selectedYear = now.getFullYear();
        selectedMonth = now.getMonth() + 1;
        fillControls();
        updateCalendar();
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
        selectMonth.addEventListener('change', () => { selectedMonth = parseInt(selectMonth.value); updateCalendar(); });
        selectYear.addEventListener('change', () => { selectedYear = parseInt(selectYear.value); updateCalendar(); });
        printBtn.addEventListener('click', () => window.print());
        downloadBtn.addEventListener('click', downloadCalendarImage);
    }
    function fillControls() { selectMonth.innerHTML = NOMBRES_MESES.map((mes, idx) => `<option value="${idx + 1}">${mes}</option>`).join(''); selectMonth.value = selectedMonth; let yearOptions = ''; for (let y = MIN_YEAR; y <= MAX_YEAR; y++) { yearOptions += `<option value="${y}">${y}</option>`; } selectYear.innerHTML = yearOptions; selectYear.value = selectedYear; }
    function changeMonth(direction) { selectedMonth += direction; if (selectedMonth < 1) { selectedMonth = 12; selectedYear--; } else if (selectedMonth > 12) { selectedMonth = 1; selectedYear++; } if (selectedYear < MIN_YEAR) selectedYear = MIN_YEAR; if (selectedYear > MAX_YEAR) selectedYear = MAX_YEAR; fillControls(); updateCalendar(); }
    async function updateCalendar() { const data = await getMonthlyData(selectedYear, selectedMonth); if (!data) { calendarContainer.innerHTML = `<p>No hay datos disponibles.</p>`; return; } calendarTitle.textContent = `Calendario Astral - ${NOMBRES_MESES[selectedMonth - 1]} ${selectedYear}`; buildCalendar(data.astro, selectedYear, selectedMonth, data.festivos); }
    function buildCalendar(monthData, year, month, festivosDelMes) { calendarContainer.innerHTML = ''; DIAS_SEMANA.forEach(day => { const headerCell = document.createElement('div'); headerCell.classList.add('calendar-cell', 'day-header'); headerCell.textContent = day; calendarContainer.appendChild(headerCell); }); const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); const emptyCells = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; for (let i = 0; i < emptyCells; i++) { const emptyCell = document.createElement('div'); emptyCell.classList.add('calendar-cell', 'empty-cell'); calendarContainer.appendChild(emptyCell); } const daysInMonth = new Date(year, month, 0).getDate(); for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) { const dayData = monthData[String(dayNum)] || {}; const dayCell = document.createElement('div'); dayCell.classList.add('calendar-cell'); const eventCount = countEvents(dayData); if (eventCount >= 3) { const warningIcon = document.createElement('img'); warningIcon.src = ICON_PATHS.alerts.Warning; warningIcon.classList.add('warning-icon'); dayCell.appendChild(warningIcon); } const dayTitleContainer = document.createElement('div'); dayTitleContainer.classList.add('day-title-container'); const dateNumber = document.createElement('div'); dateNumber.classList.add('date-number'); const dayDate = new Date(year, month - 1, dayNum); if (dayDate.getDay() === 0 || festivosDelMes.includes(dayNum)) { dateNumber.classList.add('sunday'); } dateNumber.textContent = dayNum; dayTitleContainer.appendChild(dateNumber); if (dayData.Eclipse) { const eclipseKey = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`; const path = ICON_PATHS.events[eclipseKey]; if (path) { const icon = document.createElement('img'); icon.src = path; icon.classList.add('day-event-icon'); dayTitleContainer.appendChild(icon); } } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) { const path = ICON_PATHS.events[dayData.Moon_Phase]; if (path) { const icon = document.createElement('img'); icon.src = path; icon.classList.add('day-event-icon'); dayTitleContainer.appendChild(icon); } } dayCell.appendChild(dayTitleContainer); const eventsContainer = document.createElement('div'); eventsContainer.classList.add('astro-events'); addEventsToCell(eventsContainer, dayData); dayCell.appendChild(eventsContainer); calendarContainer.appendChild(dayCell); if (eventCount > 0) { dayCell.classList.add('highlight'); dayCell.addEventListener('click', () => showDayDetailsModal(year, month, dayNum)); } } }
    
    // =========================================================================
    // ==              VISTA ATERRIZAJE MÓVIL (LANDING)                     ==
    // =========================================================================
    function initMobileLandingView() {
        if (!mobileLandingContainer) return;
        renderLandingView(landingDate);
        let touchStartX = 0, touchStartY = 0;
        mobileLandingContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; touchStartY = e.changedTouches[0].clientY; }, { passive: true });
        mobileLandingContainer.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].clientX, touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX, deltaY = touchEndY - touchStartY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                changeLandingMonth(deltaX < 0 ? 1 : -1);
            }
        });
        landingMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); landingMenuDropdown.style.display = landingMenuDropdown.style.display === 'none' ? 'block' : 'none'; });
        landingSymbolBtn.addEventListener('click', showSymbolModal);
        landingInfoBtn.addEventListener('click', showInstallHelpModal);
        landingDownloadBtn.addEventListener('click', downloadCalendarImage);
        landingTodayBtn.addEventListener('click', () => { landingDate = new Date(); renderLandingView(landingDate); });
        document.addEventListener('click', () => { landingMenuDropdown.style.display = 'none'; });
        return renderLandingView(landingDate);
    }

    function changeLandingMonth(direction) { landingDate.setMonth(landingDate.getMonth() + direction); renderLandingView(landingDate); }
    
    async function renderLandingView(date) {
        const personalEvents = getPersonalEvents(); // **CORRECCIÓN #1**
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();
        let todayCellElement = null;
        let todayDataPayload = {};
        landingMonthYear.textContent = `${NOMBRES_MESES[month - 1]} ${year}`;
        landingCalendarGrid.innerHTML = '<div class="loader">Cargando...</div>';
        landingDayDetails.innerHTML = '<p class="initial-prompt">Toca un día.</p>';
        if (selectedDayCell) {
            selectedDayCell.classList.remove('selected');
            selectedDayCell = null;
        }
        const data = await getMonthlyData(year, month);
        landingCalendarGrid.innerHTML = '';
        if (!data) {
            landingCalendarGrid.innerHTML = `<p class="loader">No hay datos.</p>`;
            return;
        }
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const emptyCells = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('landing-day-cell', 'empty');
            landingCalendarGrid.appendChild(emptyCell);
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('landing-day-cell');
            const dateText = document.createElement('span');
            dateText.classList.add('date-text');
            dateText.textContent = dayNum;
            const selectionCircle = document.createElement('div');
            selectionCircle.classList.add('selection-circle');
            dayCell.appendChild(selectionCircle);
            dayCell.appendChild(dateText);
            const dayData = data.astro[String(dayNum)] || {};
            const festivos = data.festivos || [];
            let specialEventIconPath = '';
            let specialEventClasses = 'event-day-marker';
            if (dayData.Eclipse) {
                specialEventIconPath = 'assets/aspects/eclipse.gif';
            } else if (dayData.Moon_Phase === 'Luna Nueva') {
                specialEventIconPath = 'assets/aspects/luna_nueva.gif';
                specialEventClasses += ' moon-event-marker';
            } else if (dayData.Moon_Phase === 'Luna Llena') {
                specialEventIconPath = 'assets/aspects/luna_llena.gif';
                specialEventClasses += ' moon-event-marker';
            }
            if (specialEventIconPath) {
                const eventIcon = document.createElement('img');
                eventIcon.src = specialEventIconPath;
                eventIcon.className = specialEventClasses;
                dayCell.appendChild(eventIcon);
            }
            if (countEvents(dayData) >= 3) {
                const warningIcon = document.createElement('img');
                warningIcon.src = ICON_PATHS.alerts.Warning;
                warningIcon.className = 'intense-day-marker';
                dayCell.appendChild(warningIcon);
            }
            const aspectColors = getAspectColors(dayData);
            if (aspectColors.length > 0) {
                const dotsContainer = document.createElement('div');
                dotsContainer.classList.add('dots-container');
                aspectColors.forEach(colorClass => {
                    const dot = document.createElement('div');
                    dot.classList.add('event-dot', colorClass);
                    dotsContainer.appendChild(dot);
                });
                dayCell.appendChild(dotsContainer);
            }
            if (new Date(year, month - 1, dayNum).getDay() === 0 || festivos.includes(dayNum)) {
                dayCell.classList.add('holiday');
            }

            // **CORRECCIÓN #2: MOSTRAR ICONO PERSONAL**
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayPersonalEvents = personalEvents[dateKey];

            // Lógica de prioridad: el evento personal tiene más importancia que el warning.
            if (dayPersonalEvents && dayPersonalEvents.length > 0) {
                // Si hay un evento personal, mostrar su icono.
                const eventIcon = document.createElement('img');
                eventIcon.src = dayPersonalEvents[0].icon;
                eventIcon.className = 'personal-event-icon-grid'; // Usa el estilo de la esquina derecha
                eventIcon.title = dayPersonalEvents[0].name;
                dayCell.appendChild(eventIcon);
            } else if (countEvents(dayData) >= 3) {
                // Si NO hay evento personal PERO el día es intenso, mostrar el warning.
                const warningIcon = document.createElement('img');
                warningIcon.src = ICON_PATHS.alerts.Warning;
                warningIcon.className = 'intense-day-marker'; // Este ya estaba posicionado a la derecha
                dayCell.appendChild(warningIcon);
            }
            // **FIN DE CORRECCIÓN #2**

            dayCell.addEventListener('click', () => handleLandingDayClick(dayCell, new Date(year, month - 1, dayNum), dayData));
            landingCalendarGrid.appendChild(dayCell);
            if (dayNum === todayDate && month === todayMonth && year === todayYear) {
                todayCellElement = dayCell;
                todayDataPayload = dayData;
            }
        }
        if (todayCellElement) {
            handleLandingDayClick(todayCellElement, today, todayDataPayload);
        }
    }
    
    function getSpecialDayClassification(dayData) {
        if (!dayData || !dayData.Aspects) return null;
        for (const p1 in dayData.Aspects) {
            for (const p2 in dayData.Aspects[p1]) {
                const aspectType = dayData.Aspects[p1][p2].type;
                if ((p1 === 'Saturn' && p2 === 'Mars') || (p1 === 'Mars' && p2 === 'Saturn')) {
                    if (['Conjunction', 'Opposition', 'Square'].includes(aspectType)) return { title: 'Día de Mala Suerte', iconPath: ICON_PATHS.special_days['Día de Mala Suerte'], colorClass: 'day-bad-luck' };
                }
                if ((p1 === 'Sun' && p2 === 'Venus') || (p1 === 'Venus' && p2 === 'Sun')) {
                    if (['Conjunction', 'Trine', 'Sextile'].includes(aspectType)) return { title: 'Día Amoroso', iconPath: ICON_PATHS.special_days['Día Amoroso'], colorClass: 'day-love' };
                }
                if ((p1 === 'Jupiter' && (p2 === 'Sun' || p2 === 'Venus')) || (p2 === 'Jupiter' && (p1 === 'Sun' || p1 === 'Venus'))) {
                    if (['Conjunction', 'Trine', 'Sextile'].includes(aspectType)) return { title: 'Día Suertudo', iconPath: ICON_PATHS.special_days['Día Suertudo'], colorClass: 'day-lucky' };
                }
            }
        }
        return null;
    }

    function getGeneralDayClassification(dayData) {
        if (!dayData) return null;
        const ICON_GIF_PATHS = { tension: 'assets/aspects/tension.gif', friction: 'assets/aspects/friccion.gif', harmonic: 'assets/aspects/armonico.gif', creative: 'assets/aspects/creativo.gif', change: 'assets/aspects/cambio.gif', revelation: 'assets/aspects/revelacion.gif' };
        const aspectCounts = { Trine: 0, Square: 0, Opposition: 0, Sextile: 0 };
        if (dayData.Aspects) {
            const processed = new Set();
            for (const p1 in dayData.Aspects) { for (const p2 in dayData.Aspects[p1]) { const key = [p1, p2].sort().join('-'); if (processed.has(key)) continue; processed.add(key); const aspectType = dayData.Aspects[p1][p2].type; if (aspectCounts.hasOwnProperty(aspectType)) aspectCounts[aspectType]++; } }
        }
        const slowPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node'];
        if (dayData.Aspects?.Sun) { for (const planet in dayData.Aspects.Sun) { if (slowPlanets.includes(planet) && dayData.Aspects.Sun[planet].type === 'Conjunction') return { title: 'Día de Revelación', iconPath: ICON_GIF_PATHS.revelation, colorClass: 'day-revelation' }; } }
        if (aspectCounts.Square >= 2 && aspectCounts.Opposition >= 1) return { title: 'Día de Tensión', iconPath: ICON_GIF_PATHS.tension, colorClass: 'day-tension' };
        if (aspectCounts.Square >= 2 || aspectCounts.Opposition >= 2) return { title: 'Día de Fricción', iconPath: ICON_GIF_PATHS.friction, colorClass: 'day-friction' };
        if (aspectCounts.Trine >= 2 && aspectCounts.Square <= 1) return { title: 'Día Armónico', iconPath: ICON_GIF_PATHS.harmonic, colorClass: 'day-harmonic' };
        if (aspectCounts.Sextile >= 2 || (aspectCounts.Sextile >= 1 && aspectCounts.Trine >= 1)) return { title: 'Día Creativo', iconPath: ICON_GIF_PATHS.creative, colorClass: 'day-creative' };
        const hasPlanetChange = dayData.Sign_Changes?.some(change => change.planet !== 'Moon');
        if (hasPlanetChange) return { title: 'Día de Cambio', iconPath: ICON_GIF_PATHS.change, colorClass: 'day-change' };
        return null;
    }

    function handleLandingDayClick(cell, date, dayData) {
        if (selectedDayCell === cell) {
            if (currentDetailDate) navigateToDetailView(currentDetailDate);
            return;
        }
        if (selectedDayCell) selectedDayCell.classList.remove('selected');
        cell.classList.add('selected');
        selectedDayCell = cell;
        landingDayDetails.innerHTML = '';
        currentDetailDate = date;
        let hasContent = false;
        const contentWrapper = document.createElement('div');

        const specialClassification = getSpecialDayClassification(dayData);
        if (specialClassification) {
            const specialDayRow = document.createElement('div');
            specialDayRow.classList.add('special-day-row', specialClassification.colorClass, 'clickable-title');
            specialDayRow.innerHTML = `<img src="${specialClassification.iconPath}" alt="${specialClassification.title}"><span>${specialClassification.title}</span><img src="${specialClassification.iconPath}" alt="${specialClassification.title}">`;
            specialDayRow.onclick = () => showAndScrollToSymbol(specialClassification.title);
            contentWrapper.appendChild(specialDayRow);
        }

        const generalClassification = getGeneralDayClassification(dayData);
        if (generalClassification) {
            const generalDayRow = document.createElement('div');
            generalDayRow.classList.add('special-day-row', generalClassification.colorClass, 'clickable-title');
            generalDayRow.innerHTML = `<img src="${generalClassification.iconPath}" alt="${generalClassification.title}"><span>${generalClassification.title}</span><img src="${generalClassification.iconPath}" alt="${generalClassification.title}">`;
            generalDayRow.onclick = () => showAndScrollToSymbol(generalClassification.title);
            contentWrapper.appendChild(generalDayRow);
        } else if (!specialClassification && countEvents(dayData) >= 3) {
            const warningIconPath = ICON_PATHS.alerts.Warning;
            const intenseDayRow = document.createElement('div');
            intenseDayRow.classList.add('special-day-row', 'day-intense');
            intenseDayRow.innerHTML = `<img src="${warningIconPath}" alt="Alerta"><span>DÍA INTENSO</span><img src="${warningIconPath}" alt="Alerta">`;
            contentWrapper.appendChild(intenseDayRow);
        }

        if (contentWrapper.hasChildNodes()) {
            const separatorTop = document.createElement('div');
            separatorTop.className = 'details-separator';
            contentWrapper.appendChild(separatorTop);
            hasContent = true;
        }

        const specialEventsDiv = document.createElement('div');
        if (dayData.Eclipse) { const eventName = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`; const eventIconPath = ICON_PATHS.events[eventName]; if (eventIconPath) specialEventsDiv.innerHTML += `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`; }
        else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) { const eventName = dayData.Moon_Phase; const eventIconPath = ICON_PATHS.events[eventName]; if (eventIconPath) specialEventsDiv.innerHTML += `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`; }
        if (specialEventsDiv.hasChildNodes()) {
            contentWrapper.appendChild(specialEventsDiv);
            hasContent = true;
        }
        
        const eventsContainer = document.createElement('div');
        addEventsToCell(eventsContainer, dayData);
        if (eventsContainer.hasChildNodes()) {
            contentWrapper.appendChild(eventsContainer);
            hasContent = true;
        }
        if (hasContent) {
            landingDayDetails.appendChild(contentWrapper);
            const personalEvents = getPersonalEvents();
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayPersonalEvents = personalEvents[dateKey];
            if (dayPersonalEvents && dayPersonalEvents.length > 0) {
                const personalEventsContainer = document.createElement('div');
                personalEventsContainer.className = 'personal-events-container';
                dayPersonalEvents.forEach((event, index) => {
                    const eventRow = document.createElement('div');
                    eventRow.className = 'personal-event-details-row';
                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'delete-event-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.title = 'Eliminar evento';
                    deleteBtn.onclick = () => deletePersonalEvent(date, index);
                    const timePrefix = (event.time && event.time !== 'Todo el día') ? `${event.time} ` : '';
                    eventRow.innerHTML = `<img src="${event.icon}" alt="${event.name}"><span>${timePrefix}${event.name}</span>`;
                    eventRow.appendChild(deleteBtn);
                    personalEventsContainer.appendChild(eventRow);
                });
                landingDayDetails.appendChild(personalEventsContainer);
            }
            mobileActionBar.style.display = 'flex'; // Muestra la barra de acciones
        } else {
            landingDayDetails.innerHTML = '<p class="initial-prompt">No hay eventos para mostrar.</p>';
            mobileActionBar.style.display = 'none'; // Oculta la barra si no hay eventos
        }
        
    }

    function navigateToDetailView(date) { mobileLandingContainer.style.display = 'none'; mobileContainer.style.display = 'flex'; backToLandingBtn.style.display = 'flex'; mobileDate = date; renderMobileView(date); }
    
    // =========================================================================
    // ==                      LÓGICA VISTA MÓVIL (DIARIA)                    ==
    // =========================================================================
    function initMobileView() {
        if (!mobileContainer) return;
        renderMobileView(mobileDate);
        prevDayMobileBtn.addEventListener('click', () => changeMobileDay(-1));
        nextDayMobileBtn.addEventListener('click', () => changeMobileDay(1));
        goToTodayBtn.addEventListener('click', () => { mobileDate = new Date(); renderMobileView(mobileDate); });
        showAspectsBtn.addEventListener('click', () => showAspectsModal(mobileDate));
        let touchStartX = 0;
        mobileContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        mobileContainer.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) changeMobileDay(1);
            else if (touchEndX - touchStartX > swipeThreshold) changeMobileDay(-1);
        });
    }
    function changeMobileDay(direction) { mobileDate.setDate(mobileDate.getDate() + direction); renderMobileView(mobileDate); }
    async function renderMobileView(date) { mobileDayContent.innerHTML = `<div class="loader">Cargando...</div>`; const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate(); const data = await getMonthlyData(year, month); if (!data) { mobileDayContent.innerHTML = `<p>No hay datos.</p>`; return; } const dayAstroData = data.astro[day] || {}; const dayTextData = data.textos[day] || {}; mobileDayContent.innerHTML = generateDayContentHTML(date, dayAstroData, dayTextData, data.festivos); }
    function getAspectColors(dayData) { const colors = []; if (!dayData || !dayData.Aspects) return colors; const processed = new Set(); for (const p1 in dayData.Aspects) { for (const p2 in dayData.Aspects[p1]) { const key = [p1, p2].sort().join('-'); if (processed.has(key)) continue; processed.add(key); const aspectType = dayData.Aspects[p1][p2].type; if (ASPECT_COLORS[aspectType]) { colors.push(ASPECT_COLORS[aspectType]); } } } return colors; }
    
    // =========================================================================
    // ==                     FUNCIONES COMPARTIDAS Y MODALES                 ==
    // =========================================================================
    function generateDayContentHTML(date, astro, textos, festivos) { const dayNum = date.getDate(); const esDomingo = date.getDay() === 0; const esFestivo = isHoliday(date, festivos); const eventCount = countEvents(astro); const nombreDia = capitalize(date.toLocaleDateString('es-ES', { weekday: 'long' })); const nombreMes = capitalize(date.toLocaleDateString('es-ES', { month: 'long' })); let html = `<h1 style="color: ${esFestivo || esDomingo ? 'var(--color-texto-domingo)' : 'inherit'}">${nombreDia} ${dayNum} de ${nombreMes} ${date.getFullYear()}</h1>`; if (eventCount >= 3) html += `<p style="text-align: center; color: red; font-weight: bold;"><img class="header-icon" src="assets/aspects/warning.gif" title="Día intenso"> DÍA INTENSO <img class="header-icon" src="assets/aspects/warning.gif" title="Día intenso"></p>`; if (textos && Object.keys(textos).length > 0) { if (textos.introduccion_diaria) html += `<h2>🌞 Introducción</h2><p>${textos.introduccion_diaria}</p>`; if (textos.interpretacion_aspectos?.length > 0) { html += '<h2>🔮 Interpretación</h2>'; textos.interpretacion_aspectos.forEach(t => html += `<p>${t}</p>`); } if (textos.eventos_especiales?.length > 0) { html += '<h2>✨ Eventos</h2>'; textos.eventos_especiales.forEach(t => html += `<p>${t}</p>`); } if (textos.consejo_del_dia) html += `<h2>💡 Consejo</h2><p>${textos.consejo_del_dia}</p>`; } else { html += '<p>Sin interpretaciones disponibles.</p>'; } return html; }

    async function showDayDetailsModal(year, month, dayNum) {
        const modal = document.getElementById('modal-detail');
        const modalTextos = document.getElementById('modal-textos');
        const data = await getMonthlyData(year, month);
        const date = new Date(year, month - 1, dayNum);
        let contentHtml = '';
        if (data) {
            const astro = data.astro[dayNum] || {};
            const textos = data.textos[dayNum] || {};
            contentHtml = generateDayContentHTML(date, astro, textos, data.festivos);
        } else {
            contentHtml = `<p>Error al cargar.</p>`;
        }
        modalTextos.innerHTML = contentHtml;
        openModal(modal); // <-- Llama al gestor
    }

    async function showSymbolModal() {
        const modal = document.getElementById('modal-symbol');
        const modalContent = document.getElementById('modal-symbol-content');
        modalContent.innerHTML = '<div class="loader">Cargando...</div>';
        openModal(modal); // <-- Llama al gestor
        try {
            const res = await fetch('Calendar/Simbologia.json');
            // ... (el resto de la función es igual, solo borramos la lógica de cierre)
            if (!res.ok) throw new Error('Archivo no encontrado'); const data = await res.json(); let mainHtml = `<h1 style="text-align:center;">Simbología</h1>`; for (const seccion in data) { mainHtml += `<h2 style="margin-top: 20px;">✨${capitalize(seccion)}✨</h2>`; const grupo = data[seccion]; for (const key in grupo) { const item = grupo[key]; const entryId = 'simbologia-' + key.replace(/\s+/g, '-').toLowerCase(); let iconHtml = ''; if (item.gif) { iconHtml = `<img src="${item.gif}" alt="${key}" style="height: 28px; width: 28px; object-fit: contain; vertical-align: middle; margin-right: 6px;">`; } else { let iconPath = ICON_PATHS.signs[key] || ICON_PATHS.planets[key] || ICON_PATHS.aspects[key] || ''; if (iconPath) { iconHtml = `<img src="${iconPath}" alt="${key}" style="height: 28px; width: 28px; object-fit: contain; vertical-align: middle; margin-right: 6px;">`; } } mainHtml += `<div id="${entryId}" style="margin-bottom: 1rem;">`; mainHtml += `${iconHtml}<strong>${item.nombre || key}</strong><br>`; if (item.lema) { mainHtml += `<small style="font-weight:bold;">${item.lema}</small><br>`; } else if (item.condicion) { mainHtml += `<small style="font-weight:bold; color: #555;">Condición: ${item.condicion}</small><br>`; } mainHtml += `<span>${item.descripcion}</span></div>`; } }
            modalContent.innerHTML = mainHtml;
        } catch (error) {
            console.error("Error al cargar Simbologia.json:", error);
            modalContent.innerHTML = `<p>Error al cargar la simbología.</p>`;
        }
    }

    async function showAndScrollToSymbol(key) { await showSymbolModal(); const targetId = 'simbologia-' + key.replace(/\s+/g, '-').toLowerCase(); const targetElement = document.getElementById(targetId); if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }

    async function showAspectsModal(date) {
        const modal = document.getElementById('modal-aspects');
        const modalContent = document.getElementById('modal-aspects-content');
        
        // Muestra el loader y abre el modal con el gestor central
        modalContent.innerHTML = `<div class="loader">Cargando...</div>`;
        openModal(modal); // ¡Esto se encarga de todo!

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const data = await getMonthlyData(year, month);

        let html = `<h1>✨Aspectos</h1>`;
        let specialEventsHtml = '';

        if (data && data.astro[day]) {
            const dayData = data.astro[day];
            let eventName = '';
            let eventIconPath = '';
            if (dayData.Eclipse) {
                eventName = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`;
                eventIconPath = ICON_PATHS.events[eventName];
            } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) {
                eventName = dayData.Moon_Phase;
                eventIconPath = ICON_PATHS.events[eventName];
            }
            if (eventName && eventIconPath) {
                specialEventsHtml = `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`;
            }
            
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('astro-events');
            addEventsToCell(eventsContainer, dayData);
            
            const regularAspectsHtml = eventsContainer.innerHTML;
            if (specialEventsHtml || regularAspectsHtml) {
                html += specialEventsHtml + regularAspectsHtml;
            } else {
                html += '<p>No hay aspectos mayores.</p>';
            }
        } else {
            html += '<p>No hay aspectos mayores.</p>';
        }

        modalContent.innerHTML = html;
    }

    function showInstallHelpModal() {
       const modal = document.getElementById('modal-install'); openModal(modal); // ¡Y ya está! Delega todo al gestor central.
    }

    async function showAboutModal() {
        const modal = document.getElementById('modal-about');
        const modalContent = document.getElementById('modal-about-content');
        modalContent.innerHTML = '<div class="loader">Cargando...</div>';
        openModal(modal);

        try {
            const res = await fetch('creditos.json');
            if (!res.ok) throw new Error('No se pudo cargar el archivo de créditos.');
            const data = await res.json();

            // Función interna para construir la vista de botones
            const buildButtonsView = () => {
                let html = `<h2>${data.tituloModal}</h2><div id="about-buttons-container">`;
                data.botones.forEach(btnData => {
                    html += `
                        <button class="about-button" data-type="${btnData.tipo}" data-target="${btnData.url || btnData.claveContenido}">
                            <div class="icon-container">
                                <img src="${btnData.icono}" alt="">
                            </div>
                            <div class="text-container">
                                <div class="title">${btnData.titulo}</div>
                                <div class="subtitle">${btnData.subtitulo}</div>
                            </div>
                        </button>
                    `;
                });
                html += '</div>';
                modalContent.innerHTML = html;

                // Añadir los listeners a los botones recién creados
                modalContent.querySelectorAll('.about-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const type = button.dataset.type;
                        const target = button.dataset.target;
                        if (type === 'link') {
                            window.open(target, '_blank');
                        } else if (type === 'interno') {
                            buildInternalContentView(target);
                        }
                    });
                });
            };

            // Función interna para construir la vista de contenido (intro o créditos)
            const buildInternalContentView = (contentKey) => {
                const contentData = data.contenidoInterno[contentKey];
                let html = `<div class="about-internal-content"><h3>${contentData.titulo}</h3>`;
                if (contentData.texto) {
                    html += `<p>${contentData.texto}</p>`;
                }
                if (contentData.lista) {
                    html += '<ul class="credits-list">';
                    contentData.lista.forEach(item => { html += `<li>${item}</li>`; });
                    html += '</ul>';
                }
                html += `<button class="btn back-to-about-btn">← Volver</button></div>`;
                modalContent.innerHTML = html;
                
                // Listener para el botón de volver
                modalContent.querySelector('.back-to-about-btn').onclick = buildButtonsView;
            };

            // Iniciar construyendo la vista de botones
            buildButtonsView();

        } catch (error) {
            console.error("Error al cargar creditos.json:", error);
            modalContent.innerHTML = `<p>No se pudo cargar la información de créditos en este momento.</p>`;
        }
    }

    function openEventTypeSelectorModal(date) {
        const modal = document.getElementById('modal-select-event-type');
        const grid = document.getElementById('event-type-grid');
        grid.innerHTML = ''; // Limpia la grilla

        for (const typeKey in PERSONAL_EVENT_TYPES) {
            const typeInfo = PERSONAL_EVENT_TYPES[typeKey];
            const optionBtn = document.createElement('button');
            optionBtn.className = 'event-type-option';
            optionBtn.innerHTML = `
                <img src="${typeInfo.icon}" alt="${typeInfo.name}">
                <span>${typeInfo.name.substring(2)}</span>
            `;
            optionBtn.onclick = () => {
                closeActiveModal(); // Cierra este modal de selección
                openEventDetailsModal(date, typeKey); // Abre el segundo modal con los detalles
            };
            grid.appendChild(optionBtn);
        }
        openModal(modal);
    }

    // 2. Abre el SEGUNDO modal (para añadir nombre y hora)
    function openEventDetailsModal(date, eventType) {
        const typeInfo = PERSONAL_EVENT_TYPES[eventType];
        const header = document.getElementById('selected-event-header');
        const timeSelect = document.getElementById('event-time-select');
        const eventTypeInput = document.getElementById('event-type-input');

        header.innerHTML = `
            <img src="${typeInfo.icon}" alt="${typeInfo.name}">
            <span>${typeInfo.name.substring(2)}</span>
        `;

        timeSelect.innerHTML = '';
        const allDayOption = document.createElement('option');
        allDayOption.value = 'Todo el día';
        allDayOption.textContent = 'Todo el día';
        timeSelect.appendChild(allDayOption);

        for (let i = 0; i < 24; i++) {
            const hour = String(i).padStart(2, '0');
            const option = document.createElement('option');
            option.value = `${hour}:00`;
            option.textContent = `${hour}:00`;
            timeSelect.appendChild(option);
        }

        eventNameInput.value = '';
        eventDateInput.value = date.toISOString();
        eventTypeInput.value = eventType;

        saveEventBtn.onclick = () => {
            const eventName = eventNameInput.value.trim();
            if (!eventName) {
                alert('Por favor, escribe un nombre para el evento.');
                return;
            }
            const eventData = {
                type: eventTypeInput.value,
                name: eventName,
                icon: PERSONAL_EVENT_TYPES[eventTypeInput.value].icon,
                time: timeSelect.value
            };
            addPersonalEvent(new Date(eventDateInput.value), eventData);
            closeActiveModal();
            renderLandingView(landingDate);
        };

        openModal(modalAddEvent);
    }


    function closeAddEventModal() {
        modalAddEvent.style.display = 'none';
        modalBackBtn.style.display = 'none';
    }

    async function showExplanationModal() {
        const modal = document.getElementById('modal-explanation');
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = '<div class="loader">Cargando guía...</div><span class="close-button">❌</span>';
        openModal(modal);

        try {
            const res = await fetch('info.json');
            if (!res.ok) throw new Error('No se pudo cargar la guía.');
            const data = await res.json();

            // Construir el HTML dinámico del acordeón
            let html = `<h2>${data.tituloPrincipal}</h2>`;
            html += `<p class="intro">${data.introduccion}</p>`;
            
            data.secciones.forEach(seccion => {
                html += `
                    <div class="info-accordion-item">
                        <button class="info-accordion-btn">${seccion.titulo}</button>
                        <div class="info-accordion-panel">
                            <p>${seccion.contenido}</p>
                        </div>
                    </div>
                `;
            });
            
            // Reemplaza el loader con el contenido final y re-añade la 'X'
            modalContent.innerHTML = html + '<span class="close-button">❌</span>';
            
            // ¡MUY IMPORTANTE! Añadir los listeners DESPUÉS de crear los botones
            modal.querySelectorAll('.info-accordion-btn').forEach(button => {
                button.addEventListener('click', () => {
                    button.classList.toggle('active');
                    const panel = button.nextElementSibling;
                    if (panel.style.maxHeight) {
                        panel.style.maxHeight = null;
                    } else {
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    }
                });
            });
            // Reconectar la 'X' superior
            modal.querySelector('.close-button').onclick = closeActiveModal;

        } catch (error) {
            console.error("Error al cargar info.json:", error);
            modalContent.innerHTML = `<p>No se pudo cargar la guía en este momento.</p><span class="close-button">❌</span>`;
            modal.querySelector('.close-button').onclick = closeActiveModal;
        }
    }

    function setDynamicHeight() { const vh = window.innerHeight; const mobileLanding = document.getElementById('mobile-landing-container'); if (mobileLanding) { mobileLanding.style.height = `${vh}px`; } }
    
    // =========================================================================
    // ==                           INICIALIZACIÓN                            ==
    // =========================================================================
    async function initializeApp() {
        // 1. Asignar todos los listeners a sus botones.
        if(enableNotificationsBtn) enableNotificationsBtn.addEventListener('click', requestNotificationPermission);
        if(symbolBtn) symbolBtn.addEventListener('click', showSymbolModal);
        if(symbolBtnMobile) symbolBtnMobile.addEventListener('click', showSymbolModal);
        if(installHelpBtn) installHelpBtn.addEventListener('click', showInstallHelpModal);
        if(landingAboutBtn) landingAboutBtn.addEventListener('click', showAboutModal);
        if(landingInfoBtn) landingInfoBtn.addEventListener('click', showInstallHelpModal);
        if (actionInterpretBtn) actionInterpretBtn.onclick = () => { if (currentDetailDate) navigateToDetailView(currentDetailDate); };
        if (actionInfoBtn) actionInfoBtn.onclick = showExplanationModal;
        if (actionAddBtn) actionAddBtn.onclick = () => { if (currentDetailDate) openEventTypeSelectorModal(currentDetailDate); };

        // *** LÓGICA UNIFICADA Y DEFINITIVA PARA EL BOTÓN FLOTANTE ***
        if(backToLandingBtn) {
            backToLandingBtn.addEventListener('click', () => {
                if (activeModal) {
                    // PRIORIDAD 1: Si hay un modal activo, lo cierra.
                    closeActiveModal();
                } else if (mobileContainer.style.display === 'flex') {
                    // PRIORIDAD 2: Si no hay modal pero estamos en la vista de detalle, vuelve al calendario.
                    mobileContainer.style.display = 'none';
                    backToLandingBtn.style.display = 'none';
                    mobileLandingContainer.style.display = 'flex';
                }
            });
        }
        
        setDynamicHeight(); 
        window.addEventListener('resize', setDynamicHeight);

        if (window.innerWidth <= 768 && mobileLandingContainer) {
            await initMobileLandingView();
            initMobileView();
        } else {
            initDesktopView();
        }
    }

    // 4. Llamar a la función principal para que todo empiece.
    initializeApp();
});