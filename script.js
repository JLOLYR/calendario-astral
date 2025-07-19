document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // ==                      CONSTANTES Y VARIABLES GLOBALES                ==
    // =========================================================================
    const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const FASES_LUNARES_PRINCIPALES = ['Luna Nueva', 'Cuarto Creciente', 'Luna Llena', 'Cuarto Menguante'];
    const ASPECT_COLORS = {
        Conjunction: 'dot-conjunction',
        Opposition: 'dot-opposition',
        Square: 'dot-square',
        Trine: 'dot-trine',
        Sextile: 'dot-sextile'
    };

    const ICON_PATHS = {
        planets: { 'Sun': 'assets/planets/Sun.png', 'Moon': 'assets/planets/Moon.png', 'Mercury': 'assets/planets/Mercury.png', 'Venus': 'assets/planets/Venus.png', 'Mars': 'assets/planets/Mars.png', 'Jupiter': 'assets/planets/Jupiter.png', 'Saturn': 'assets/planets/Saturn.png', 'Uranus': 'assets/planets/Uranus.png', 'Neptune': 'assets/planets/Neptune.png', 'Pluto': 'assets/planets/Pluto.png', 'Chiron': 'assets/planets/Chiron.png', 'North Node': 'assets/planets/North_Node.png','South Node': 'assets/planets/South_Node.png', 'Darkmoon': 'assets/planets/Dark_Moon.png', 'Pars Fortuna': 'assets/planets/Pars_Fortuna.png' },
        signs: { 'Aries': 'assets/signs/Aries.png', 'Taurus': 'assets/signs/Taurus.png', 'Gemini': 'assets/signs/Gemini.png', 'Cancer': 'assets/signs/Cancer.png', 'Leo': 'assets/signs/Leo.png', 'Virgo': 'assets/signs/Virgo.png', 'Libra': 'assets/signs/Libra.png', 'Scorpio': 'assets/signs/Scorpio.png', 'Sagittarius': 'assets/signs/Sagittarius.png', 'Capricorn': 'assets/signs/Capricorn.png', 'Aquarius': 'assets/signs/Aquarius.png', 'Pisces': 'assets/signs/Pisces.png' },
        aspects: { 'Conjunction': 'assets/aspects/Conjunction.png', 'Opposition': 'assets/aspects/Opposition.png', 'Trine': 'assets/aspects/Trine.png', 'Square': 'assets/aspects/Square.png', 'Sextile': 'assets/aspects/Sextile.png', 'Retrograde': 'assets/aspects/Retrograde.png' },
        events: {'Luna Nueva': 'assets/aspects/luna_nueva.gif','Cuarto Creciente': 'assets/aspects/luna_cuarto.gif','Luna Llena': 'assets/aspects/luna_llena.gif','Cuarto Menguante': 'assets/aspects/luna_cuarto.gif','Eclipse Lunar Total': 'assets/aspects/Eclipse Lunar Total.png','Eclipse Solar Total': 'assets/aspects/Eclipse Solar Total.png','Eclipse Lunar Partial': 'assets/aspects/Eclipse Lunar Parcial.png','Eclipse Solar Partial': 'assets/aspects/Eclipse Solar Parcial.png','Eclipse Lunar Anular': 'assets/aspects/Eclipse Lunar Anular.png','Eclipse Solar Anular': 'assets/aspects/Eclipse Solar Anular.png'},
        alerts: { 'Warning': 'assets/aspects/warning.gif' }
    };
    
    // --- Elementos del DOM ---
    // Vista Escritorio
    const calendarContainer = document.getElementById('calendar-container');
    const calendarTitle = document.querySelector('#calendar-header h1');
    const selectMonth = document.getElementById('select-month');
    const selectYear = document.getElementById('select-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const printBtn = document.getElementById('print-btn');
    const downloadBtn = document.getElementById('download-btn');
    const symbolBtn = document.getElementById('symbol-btn');
    
    // Vista Móvil (Detalle)
    const mobileContainer = document.getElementById('mobile-view-container');
    const mobileDayContent = document.getElementById('mobile-day-content');
    const prevDayMobileBtn = document.getElementById('prev-day-mobile');
    const nextDayMobileBtn = document.getElementById('next-day-mobile');
    const symbolBtnMobile = document.getElementById('symbol-btn-mobile');
    const goToTodayBtn = document.getElementById('go-to-today-btn');
    const showAspectsBtn = document.getElementById('show-aspects-btn');
    const backToLandingBtn = document.getElementById('back-to-landing-btn');

    // Vista Móvil (Aterrizaje / Landing)
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
    
    // Modales y otros
    const installHelpBtn = document.getElementById('install-help-btn');

    // --- Estado de la aplicación ---
    let selectedYear, selectedMonth;
    let mobileDate = new Date();
    let landingDate = new Date();
    let selectedDayCell = null;
    let lastTap = 0;
    let currentDetailDate = null;
    const MIN_YEAR = 2020;
    const MAX_YEAR = 2030;
    const dataCache = {};

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
            if (!astroRes) {
                console.warn(`No se encontraron datos astrales para ${monthStr}/${yearStr}`);
                return null;
            }
            const result = {
                astro: astroRes?.[year]?.[month] || {},
                textos: textoRes?.[year]?.[month] || {},
                festivos: festivosRes?.[year]?.[month] || []
            };
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
    function initDesktopView() { const now = new Date(); selectedYear = now.getFullYear(); selectedMonth = now.getMonth() + 1; fillControls(); updateCalendar(); prevMonthBtn.addEventListener('click', () => changeMonth(-1)); nextMonthBtn.addEventListener('click', () => changeMonth(1)); selectMonth.addEventListener('change', () => { selectedMonth = parseInt(selectMonth.value); updateCalendar(); }); selectYear.addEventListener('change', () => { selectedYear = parseInt(selectYear.value); updateCalendar(); }); printBtn.addEventListener('click', () => window.print()); downloadBtn.addEventListener('click', downloadCalendarImage); }
    function fillControls() { selectMonth.innerHTML = NOMBRES_MESES.map((mes, idx) => `<option value="${idx + 1}">${mes}</option>`).join(''); selectMonth.value = selectedMonth; let yearOptions = ''; for (let y = MIN_YEAR; y <= MAX_YEAR; y++) { yearOptions += `<option value="${y}">${y}</option>`; } selectYear.innerHTML = yearOptions; selectYear.value = selectedYear; }
    function changeMonth(direction) { selectedMonth += direction; if (selectedMonth < 1) { selectedMonth = 12; selectedYear--; } else if (selectedMonth > 12) { selectedMonth = 1; selectedYear++; } if (selectedYear < MIN_YEAR) selectedYear = MIN_YEAR; if (selectedYear > MAX_YEAR) selectedYear = MAX_YEAR; fillControls(); updateCalendar(); }
    async function updateCalendar() { const data = await getMonthlyData(selectedYear, selectedMonth); if (!data) { calendarContainer.innerHTML = `<p>No hay datos disponibles para este mes.</p>`; return; } calendarTitle.textContent = `Calendario Astral - ${NOMBRES_MESES[selectedMonth - 1]} ${selectedYear}`; buildCalendar(data.astro, selectedYear, selectedMonth, data.festivos); }
    function buildCalendar(monthData, year, month, festivosDelMes) { calendarContainer.innerHTML = ''; DIAS_SEMANA.forEach(day => { const headerCell = document.createElement('div'); headerCell.classList.add('calendar-cell', 'day-header'); headerCell.textContent = day; calendarContainer.appendChild(headerCell); }); const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); const emptyCells = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; for (let i = 0; i < emptyCells; i++) { const emptyCell = document.createElement('div'); emptyCell.classList.add('calendar-cell', 'empty-cell'); calendarContainer.appendChild(emptyCell); } const daysInMonth = new Date(year, month, 0).getDate(); for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) { const dayData = monthData[String(dayNum)] || {}; const dayCell = document.createElement('div'); dayCell.classList.add('calendar-cell'); const eventCount = countEvents(dayData); if (eventCount >= 4) { const warningIcon = document.createElement('img'); warningIcon.src = ICON_PATHS.alerts.Warning; warningIcon.classList.add('warning-icon'); dayCell.appendChild(warningIcon); } const dayTitleContainer = document.createElement('div'); dayTitleContainer.classList.add('day-title-container'); const dateNumber = document.createElement('div'); dateNumber.classList.add('date-number'); const dayDate = new Date(year, month - 1, dayNum); if (dayDate.getDay() === 0 || festivosDelMes.includes(dayNum)) { dateNumber.classList.add('sunday'); } dateNumber.textContent = dayNum; dayTitleContainer.appendChild(dateNumber); if (dayData.Eclipse) { const eclipseKey = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`; const path = ICON_PATHS.events[eclipseKey]; if (path) { const icon = document.createElement('img'); icon.src = path; icon.classList.add('day-event-icon'); dayTitleContainer.appendChild(icon); } } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) { const path = ICON_PATHS.events[dayData.Moon_Phase]; if (path) { const icon = document.createElement('img'); icon.src = path; icon.classList.add('day-event-icon'); dayTitleContainer.appendChild(icon); } } dayCell.appendChild(dayTitleContainer); const eventsContainer = document.createElement('div'); eventsContainer.classList.add('astro-events'); addEventsToCell(eventsContainer, dayData); dayCell.appendChild(eventsContainer); calendarContainer.appendChild(dayCell); if (eventCount > 0) { dayCell.classList.add('highlight'); dayCell.addEventListener('click', () => showDayDetailsModal(year, month, dayNum)); } } }
    function addEventsToCell(container, dayData) {
        if (!dayData) return;

        // 1. Dibuja el cambio de signo LUNAR (lógica existente, sin cambios)
        if (dayData.Moon) {
            const showsArrow = dayData.Moon.includes('CHANGE');
            const moonSign = dayData.Moon.replace('CHANGE ', '');
            let eventItems = showsArrow ? [{ category: 'planets', name: 'Moon' }, { type: 'text', value: '→' }, { category: 'signs', name: moonSign }] : [{ category: 'planets', name: 'Moon' }, { category: 'signs', name: moonSign }];
            container.appendChild(createEventRow(eventItems));
        }

        // 2. Dibuja los cambios de estado RETRÓGRADO (lógica existente, sin cambios)
        if (dayData.Retrograde_Changes?.length > 0) {
            dayData.Retrograde_Changes.forEach(change => {
                let eventItems = [];
                if (change.status === 'retrograde') eventItems = [{ category: 'planets', name: change.planet }, { type: 'text', value: '→' }, { category: 'aspects', name: 'Retrograde' }];
                else if (change.status === 'direct') eventItems = [{ category: 'aspects', name: 'Retrograde' }, { type: 'text', value: '→' }, { category: 'planets', name: change.planet }];
                if (eventItems.length > 0) container.appendChild(createEventRow(eventItems));
            });
        }

        // =======================================================================
        // ==         NUEVO BLOQUE PARA LOS CAMBIOS DE SIGNO                    ==
        // =======================================================================
        if (dayData.Sign_Changes?.length > 0) {
            dayData.Sign_Changes.forEach(change => {
                // IMPORTANTE: Evitamos duplicar el cambio de la Luna, que ya se
                // gestiona de forma especial con la propiedad "Moon" del JSON.
                if (change.planet === 'Moon') {
                    return; // Saltamos esta iteración para no dibujar dos veces a la Luna
                }

                // Creamos la estructura de iconos para "Planeta → Signo"
                const eventItems = [
                    { category: 'planets', name: change.planet },
                    { type: 'text', value: '→' },
                    { category: 'signs', name: change.to }
                ];
                
                // Creamos la fila y la añadimos al contenedor
                container.appendChild(createEventRow(eventItems));
            });
        }
        // =======================================================================

        // 4. Dibuja los Aspectos Mayores (lógica existente, sin cambios)
        if (dayData.Aspects) {
            const processed = new Set();
            for (const p1 in dayData.Aspects) {
                for (const p2 in dayData.Aspects[p1]) {
                    const aspectData = dayData.Aspects[p1][p2];
                    const key = [p1, p2].sort().join('-');
                    if (processed.has(key)) continue;
                    processed.add(key);
                    
                    container.appendChild(createEventRow([
                        { category: 'planets', name: p1 },
                        { category: 'signs', name: aspectData.planet1_sign, isSmall: true },
                        { category: 'aspects', name: aspectData.type },
                        { category: 'planets', name: p2 },
                        { category: 'signs', name: aspectData.planet2_sign, isSmall: true }
                    ], aspectData.type));
                }
            }
        }
    }
    function createEventRow(items, aspectType = null) {
        const row = document.createElement('div');
        row.classList.add('event-row');

        // NUEVO: Añadir el punto de color al principio de la fila
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
                    if (item.isSmall) {
                        img.classList.add('sign-icon-small');
                    } else {
                        img.classList.add(`${item.category}-icon`);
                    }
                    row.appendChild(img);
                }
            }
        });
        return row;
    }
    function downloadCalendarImage() {
        let elementToCapture;
        let fileName;
        const now = new Date(); // Usaremos la fecha actual para el nombre

        // Decidir qué elemento capturar basado en la vista actual
        if (window.getComputedStyle(mobileLandingContainer).display === 'flex') {
            // Estamos en la vista de aterrizaje móvil
            elementToCapture = landingCalendarGrid;
            const currentMonthName = NOMBRES_MESES[landingDate.getMonth()];
            const currentYear = landingDate.getFullYear();
            fileName = `Calendario-Astral-Movil-${currentMonthName}-${currentYear}.png`;
        } else {
            // Estamos en la vista de escritorio
            elementToCapture = calendarContainer;
            const currentMonthName = NOMBRES_MESES[selectedMonth - 1];
            fileName = `Calendario-Astral-${currentMonthName}-${selectedYear}.png`;
        }

        // Opciones para mejorar la calidad de la captura
        const options = {
            backgroundColor: "#fdfaf5", // Un fondo sólido para que se vea bien
            scale: 2 // Aumenta la resolución de la imagen final
        };

        html2canvas(elementToCapture, options).then(canvas => {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
    // =========================================================================
    // ==              VISTA ATERRIZAJE MÓVIL (LANDING)                     ==
    // =========================================================================
    function initMobileLandingView() {
        renderLandingView(landingDate);
        let touchStartX = 0;
        let touchStartY = 0;
        mobileLandingContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].clientX; // Usamos clientX para mayor compatibilidad
            touchStartY = e.changedTouches[0].clientY; // Guardamos la posición Y inicial
        }, { passive: true });
        mobileLandingContainer.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY; // Guardamos la posición Y final

            const deltaX = touchEndX - touchStartX; // Movimiento horizontal
            const deltaY = touchEndY - touchStartY; // Movimiento vertical

            const swipeThreshold = 50; // Mínimo de píxeles para considerarlo un swipe

            // --- LÓGICA MEJORADA ---
            // Solo si el movimiento horizontal es SIGNIFICATIVAMENTE MAYOR
            // que el movimiento vertical, lo consideramos un swipe.
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX < 0) {
                        // El dedo se movió hacia la izquierda
                        changeLandingMonth(1);
                    } else {
                        // El dedo se movió hacia la derecha
                        changeLandingMonth(-1);
                    }
                }
            }
        });

        landingMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); landingMenuDropdown.style.display = landingMenuDropdown.style.display === 'none' ? 'block' : 'none'; });
        landingSymbolBtn.addEventListener('click', showSymbolModal);
        landingInfoBtn.addEventListener('click', showInstallHelpModal);
        landingDownloadBtn.addEventListener('click', downloadCalendarImage);
        landingTodayBtn.addEventListener('click', () => {
        landingDate = new Date(); // Resetea la fecha a hoy
            renderLandingView(landingDate); // Vuelve a dibujar el calendario
        });
        document.addEventListener('click', () => { landingMenuDropdown.style.display = 'none'; });
    }
    function changeLandingMonth(direction) { landingDate.setMonth(landingDate.getMonth() + direction); renderLandingView(landingDate); }

    async function renderLandingView(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();
        
        let todayCellElement = null;
        let todayDataPayload = {};

        landingMonthYear.textContent = `${NOMBRES_MESES[month - 1]} ${year}`;
        landingCalendarGrid.innerHTML = '<div class="loader" style="grid-column: 1 / -1; align-self: center;">Cargando...</div>';
        landingDayDetails.innerHTML = '<p class="initial-prompt">Toca un día para ver sus eventos.</p>';
        if (selectedDayCell) { selectedDayCell.classList.remove('selected'); selectedDayCell = null; }
        
        const data = await getMonthlyData(year, month);
        landingCalendarGrid.innerHTML = '';
        
        if (!data) { landingCalendarGrid.innerHTML = `<p class="loader" style="grid-column: 1 / -1; align-self: center;">No hay datos.</p>`; return; }

        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const emptyCells = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyCells; i++) { const emptyCell = document.createElement('div'); emptyCell.classList.add('landing-day-cell', 'empty'); landingCalendarGrid.appendChild(emptyCell); }
        
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('landing-day-cell');
            
            const dateText = document.createElement('span'); dateText.classList.add('date-text'); dateText.textContent = dayNum;
            const selectionCircle = document.createElement('div'); selectionCircle.classList.add('selection-circle');
            dayCell.appendChild(selectionCircle); dayCell.appendChild(dateText);

            const dayData = data.astro[String(dayNum)] || {};
            const festivos = data.festivos || [];

            // --- LÓGICA DE ICONOS SIMPLIFICADA ---

            // 1. Quitamos la lógica que añadía los iconos de clasificación especial.

            // 2. Mantenemos los iconos de eventos lunares (Eclipse, Luna Nueva/Llena) en la esquina superior izquierda.
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

            // 3. Reintroducimos el icono de advertencia con la nueva regla (>= 3).
            if (countEvents(dayData) >= 4) {
                const warningIcon = document.createElement('img');
                warningIcon.src = ICON_PATHS.alerts.Warning;
                warningIcon.className = 'intense-day-marker';
                dayCell.appendChild(warningIcon);
            }
            
            // --- FIN DE LA LÓGICA DE ICONOS ---

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

            if (new Date(year, month - 1, dayNum).getDay() === 0 || festivos.includes(dayNum)) { dayCell.classList.add('holiday'); }
            
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

    // =========================================================================
    // ==         NUEVA FUNCIÓN PARA CLASIFICAR EL "TIPO DE DÍA"            ==
    // =========================================================================
    function getDayClassification(dayData) {
        if (!dayData) return null;

        // --- Definimos las rutas a tus nuevos GIFs ---
        const ICON_GIF_PATHS = {
            tension:    'assets/aspects/tension.gif',
            friction:   'assets/aspects/friccion.gif',
            harmonic:   'assets/aspects/armonico.gif',
            creative:   'assets/aspects/creativo.gif',
            change:     'assets/aspects/cambio.gif',
            revelation: 'assets/aspects/revelacion.gif'
        };

        const aspectCounts = { Trine: 0, Square: 0, Opposition: 0, Sextile: 0 };
        if (dayData.Aspects) {
            const processed = new Set();
            for (const p1 in dayData.Aspects) {
                for (const p2 in dayData.Aspects[p1]) {
                    const key = [p1, p2].sort().join('-');
                    if (processed.has(key)) continue;
                    processed.add(key);
                    const aspectType = dayData.Aspects[p1][p2].type;
                    if (aspectCounts.hasOwnProperty(aspectType)) {
                        aspectCounts[aspectType]++;
                    }
                }
            }
        }

        const slowPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node'];
        if (dayData.Aspects?.Sun) {
            for (const planet in dayData.Aspects.Sun) {
                if (slowPlanets.includes(planet) && dayData.Aspects.Sun[planet].type === 'Conjunction') {
                    return { title: 'Día de Revelación', iconPath: ICON_GIF_PATHS.revelation, colorClass: 'day-revelation' };
                }
            }
        }

        if (aspectCounts.Square >= 1 && aspectCounts.Opposition >= 1) {
            return { title: 'Día de Tensión', iconPath: ICON_GIF_PATHS.tension, colorClass: 'day-tension' };
        }

        if (aspectCounts.Square >= 2 || aspectCounts.Opposition >= 2) {
            return { title: 'Día de Fricción', iconPath: ICON_GIF_PATHS.friction, colorClass: 'day-friction' };
        }

        if (aspectCounts.Trine >= 2 && aspectCounts.Square <= 1) {
            return { title: 'Día Armónico', iconPath: ICON_GIF_PATHS.harmonic, colorClass: 'day-harmonic' };
        }

        if (aspectCounts.Sextile >= 2 || (aspectCounts.Sextile >= 1 && aspectCounts.Trine >= 1)) {
            return { title: 'Día Creativo', iconPath: ICON_GIF_PATHS.creative, colorClass: 'day-creative' };
        }
        
        const hasPlanetChange = dayData.Sign_Changes?.some(change => change.planet !== 'Moon');
        if (hasPlanetChange) {
            return { title: 'Día de Cambio', iconPath: ICON_GIF_PATHS.change, colorClass: 'day-change' };
        }

        return null;
    }

    function handleLandingDayClick(cell, date, dayData) {
        if (selectedDayCell === cell) { navigateToDetailView(date); return; }

        if (selectedDayCell) { selectedDayCell.classList.remove('selected'); }
        cell.classList.add('selected');
        selectedDayCell = cell;
        
        landingDayDetails.innerHTML = '';
        currentDetailDate = date;
        
        let hasContent = false;
        const contentWrapper = document.createElement('div');
        
        // Obtenemos la clasificación del día
        const classification = getDayClassification(dayData);

        if (classification) {
            const specialDayRow = document.createElement('div');
            specialDayRow.classList.add('special-day-row', classification.colorClass, 'clickable-title'); // Añadimos clase para el estilo
            specialDayRow.innerHTML = `<img src="${classification.iconPath}" alt="${classification.title}"><span>${classification.title}</span><img src="${classification.iconPath}" alt="${classification.title}">`;
            
            // --- CAMBIO CLAVE: Hacemos que la fila sea clicable ---
            specialDayRow.onclick = () => showAndScrollToSymbol(classification.title);

            contentWrapper.appendChild(specialDayRow);
        } else if (countEvents(dayData) >= 4) {
            // ... (la lógica para "Día Intenso" no cambia) ...
            const warningIconPath = ICON_PATHS.alerts.Warning;
            const intenseDayRow = document.createElement('div');
            intenseDayRow.classList.add('special-day-row', 'day-intense');
            intenseDayRow.innerHTML = `<img src="${warningIconPath}" alt="Alerta"><span>DÍA INTENSO</span><img src="${warningIconPath}" alt="Alerta">`;
            contentWrapper.appendChild(intenseDayRow);
        }

        // ... (el resto de la función para añadir separadores, eventos y el botón "Ver Interpretación" no cambia) ...
        if (classification || countEvents(dayData) >= 4) { const separatorTop = document.createElement('div'); separatorTop.className = 'details-separator'; contentWrapper.appendChild(separatorTop); hasContent = true; }
        const specialEventsDiv = document.createElement('div');
        if (dayData.Eclipse) { const eventName = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`; const eventIconPath = ICON_PATHS.events[eventName]; if (eventIconPath) specialEventsDiv.innerHTML += `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`; } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) { const eventName = dayData.Moon_Phase; const eventIconPath = ICON_PATHS.events[eventName]; if (eventIconPath) specialEventsDiv.innerHTML += `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`; }
        if(specialEventsDiv.hasChildNodes()){ contentWrapper.appendChild(specialEventsDiv); hasContent = true; }
        const eventsContainer = document.createElement('div');
        addEventsToCell(eventsContainer, dayData);
        if (eventsContainer.hasChildNodes()) { contentWrapper.appendChild(eventsContainer); hasContent = true; }
        if (hasContent) { landingDayDetails.appendChild(contentWrapper); const separatorBottom = document.createElement('div'); separatorBottom.className = 'details-separator'; landingDayDetails.appendChild(separatorBottom); const interpretationBtn = document.createElement('button'); interpretationBtn.textContent = 'Ver Interpretación'; interpretationBtn.classList.add('interpretation-btn'); interpretationBtn.onclick = () => navigateToDetailView(currentDetailDate); landingDayDetails.appendChild(interpretationBtn); } else { landingDayDetails.innerHTML = '<p class="initial-prompt">No hay eventos ni aspectos mayores para este día.</p>'; }
    }

    function navigateToDetailView(date) { mobileLandingContainer.style.display = 'none'; mobileContainer.style.display = 'flex'; backToLandingBtn.style.display = 'flex'; mobileDate = date; renderMobileView(date); }

    // =========================================================================
    // ==                      LÓGICA VISTA MÓVIL (DIARIA)                    ==
    // =========================================================================
    function initMobileView() { renderMobileView(mobileDate); prevDayMobileBtn.addEventListener('click', () => changeMobileDay(-1)); nextDayMobileBtn.addEventListener('click', () => changeMobileDay(1)); goToTodayBtn.addEventListener('click', () => { mobileDate = new Date(); renderMobileView(mobileDate); }); showAspectsBtn.addEventListener('click', () => showAspectsModal(mobileDate)); let touchStartX = 0; mobileContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true }); mobileContainer.addEventListener('touchend', e => { const touchEndX = e.changedTouches[0].screenX; const swipeThreshold = 50; if (touchStartX - touchEndX > swipeThreshold) changeMobileDay(1); else if (touchEndX - touchStartX > swipeThreshold) changeMobileDay(-1); }); }
    function changeMobileDay(direction) { mobileDate.setDate(mobileDate.getDate() + direction); renderMobileView(mobileDate); }
    async function renderMobileView(date) { mobileDayContent.innerHTML = `<div class="loader">Cargando...</div>`; const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate(); const data = await getMonthlyData(year, month); if (!data) { mobileDayContent.innerHTML = `<p>No hay datos disponibles para este día.</p>`; return; } const dayAstroData = data.astro[day] || {}; const dayTextData = data.textos[day] || {}; mobileDayContent.innerHTML = generateDayContentHTML(date, dayAstroData, dayTextData, data.festivos); }
    function getAspectColors(dayData) {
        const colors = []; // CAMBIO: Usamos un array normal, no un Set
        if (!dayData || !dayData.Aspects) return colors;

        const processed = new Set();
        for (const p1 in dayData.Aspects) {
            for (const p2 in dayData.Aspects[p1]) {
                const key = [p1, p2].sort().join('-');
                if (processed.has(key)) continue;
                processed.add(key);
                
                const aspectType = dayData.Aspects[p1][p2].type;
                if (ASPECT_COLORS[aspectType]) {
                    colors.push(ASPECT_COLORS[aspectType]); // CAMBIO: Usamos .push() para añadir a la lista
                }
            }
        }
        return colors;
    }
    // =========================================================================
    // ==                     FUNCIONES COMPARTIDAS Y MODALES                 ==
    // =========================================================================
    function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
    function countEvents(data) { let count = 0; if (!data) return 0; if (data.Moon) count++; if (data.Retrograde_Changes) count += data.Retrograde_Changes.length; if (data.Aspects) { const processed = new Set(); for (const p1 in data.Aspects) { for (const p2 in data.Aspects[p1]) { const key = [p1, p2].sort().join('-'); if (processed.has(key)) continue; processed.add(key); count++; } } } return count; }
    
    function isHoliday(date, festivosDelMes) { return festivosDelMes.includes(date.getDate()); }
    function generateDayContentHTML(date, astro, textos, festivos) { const dayNum = date.getDate(); const esDomingo = date.getDay() === 0; const esFestivo = isHoliday(date, festivos); const eventCount = countEvents(astro); const nombreDia = capitalize(date.toLocaleDateString('es-ES', { weekday: 'long' })); const nombreMes = capitalize(date.toLocaleDateString('es-ES', { month: 'long' })); let html = `<h1 style="color: ${esFestivo || esDomingo ? 'var(--color-texto-domingo)' : 'inherit'}">${nombreDia} ${dayNum} de ${nombreMes} ${date.getFullYear()}</h1>`; if (eventCount >= 4) html += `<p style="text-align: center; color: red; font-weight: bold;"><img class="header-icon" src="assets/aspects/warning.gif" title="Día intenso"> DÍA INTENSO <img class="header-icon" src="assets/aspects/warning.gif" title="Día intenso"></p>`; if (Object.keys(textos).length > 0) { if (textos.introduccion_diaria) html += `<h2>🌞 Introducción</h2><p>${textos.introduccion_diaria}</p>`; if (textos.interpretacion_aspectos?.length > 0) { html += '<h2>🔮 Interpretación</h2>'; textos.interpretacion_aspectos.forEach(t => html += `<p>${t}</p>`); } if (textos.eventos_especiales?.length > 0) { html += '<h2>✨ Eventos</h2>'; textos.eventos_especiales.forEach(t => html += `<p>${t}</p>`); } if (textos.consejo_del_dia) html += `<h2>💡 Consejo</h2><p>${textos.consejo_del_dia}</p>`; } else { html += '<p>Sin interpretaciones disponibles para este día.</p>'; } return html; }
    const homeButtonHtml = `<div class="modal-home-button-container"><button class="btn modal-home-btn"><img src="assets/planets/Sun.png" alt="Volver"><span>Volver</span></button></div>`;
    async function showDayDetailsModal(year, month, dayNum) { const modal = document.getElementById('modal-detail'); const modalTextos = document.getElementById('modal-textos'); const data = await getMonthlyData(year, month); const date = new Date(year, month - 1, dayNum); let contentHtml = ''; if (data) { const astro = data.astro[dayNum] || {}; const textos = data.textos[dayNum] || {}; contentHtml = generateDayContentHTML(date, astro, textos, data.festivos); } else { contentHtml = `<p>Error al cargar los contenidos.</p>`; } modalTextos.innerHTML = contentHtml + homeButtonHtml; modal.style.display = 'flex'; const closeModal = () => { modal.style.display = 'none'; }; modal.querySelector('.close-button').onclick = closeModal; modal.querySelector('.modal-home-btn').onclick = closeModal; modal.onclick = (e) => { if (e.target === modal) closeModal(); }; }
    async function showSymbolModal() {
        const modal = document.getElementById('modal-symbol');
        const modalContent = document.getElementById('modal-symbol-content');
        try {
            const res = await fetch('Calendar/Simbologia.json');
            if (!res.ok) throw new Error('Archivo no encontrado');
            const data = await res.json();
            
            let mainHtml = `<h1 style="text-align:center; display: flex; align-items: center; justify-content: center; gap: 10px;"><span>Simbología</span></h1>`;
            
            for (const seccion in data) {
                mainHtml += `<h2 style="margin-top: 20px;">✨${capitalize(seccion)}✨</h2>`;
                const grupo = data[seccion];
                
                for (const key in grupo) {
                    const item = grupo[key];
                    
                    // --- NUEVO: Creamos un ID único para cada entrada ---
                    // Transforma "Día Creativo" en "dia-creativo" para usarlo como ID
                    const entryId = 'simbologia-' + key.replace(/\s+/g, '-').toLowerCase();

                    let iconHtml = '';
                    if (item.gif) {
                        iconHtml = `<img src="${item.gif}" alt="${key}" style="height: 28px; width: 28px; object-fit: contain; vertical-align: middle; margin-right: 6px;">`;
                    } else {
                        let iconPath = ICON_PATHS.signs[key] || ICON_PATHS.planets[key] || ICON_PATHS.aspects[key] || '';
                        if (iconPath) {
                            iconHtml = `<img src="${iconPath}" alt="${key}" style="height: 28px; width: 28px; object-fit: contain; vertical-align: middle; margin-right: 6px;">`;
                        }
                    }
                    
                    // --- CAMBIO: Añadimos el id="${entryId}" al div ---
                    mainHtml += `<div id="${entryId}" style="margin-bottom: 1rem;">`;
                    mainHtml += `${iconHtml}<strong>${item.nombre || key}</strong><br>`;
                    
                    if (item.lema) {
                        mainHtml += `<small style="font-weight:bold;">${item.lema}</small><br>`;
                    } else if (item.condicion) {
                        mainHtml += `<small style="font-weight:bold; color: #555;">Condición: ${item.condicion}</small><br>`;
                    }
                    
                    mainHtml += `<span>${item.descripcion}</span></div>`;
                }
            }
            
            modalContent.innerHTML = mainHtml; // Quitamos el botón "Volver" del final

            modal.style.display = 'flex';
            modalBackBtn.style.display = 'flex';

            const closeModal = () => {
                modal.style.display = 'none';
                modalBackBtn.style.display = 'none';
            };
            
            modal.querySelector('.close-button').onclick = closeModal;
            modalBackBtn.onclick = closeModal;
            modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        } catch (error) {
            console.error("Error al cargar Simbologia.json:", error);
            modalContent.innerHTML = `<p>Error al cargar la simbología astral.</p>`;
        }
    }
    async function showAndScrollToSymbol(key) {
        // 1. Abrimos el modal de simbología y ESPERAMOS a que termine de cargarse.
        await showSymbolModal();

        // 2. Creamos el ID del elemento al que queremos ir.
        const targetId = 'simbologia-' + key.replace(/\s+/g, '-').toLowerCase();

        // 3. Buscamos ese elemento en el documento.
        const targetElement = document.getElementById(targetId);

        // 4. Si lo encontramos, nos desplazamos suavemente hasta él.
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', // Animación de scroll suave
                block: 'center'     // Intenta centrar el elemento en la pantalla
            });
        }
    }
    
    async function showAspectsModal(date) { const modal = document.getElementById('modal-aspects'); const modalContent = document.getElementById('modal-aspects-content'); modalContent.innerHTML = `<div class="loader">Cargando aspectos...</div>`; modal.style.display = 'flex'; const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate(); const data = await getMonthlyData(year, month); let html = `<h1>✨Aspectos</h1>`; let specialEventsHtml = ''; if (data && data.astro[day]) { const dayData = data.astro[day]; let eventName = ''; let eventIconPath = ''; if (dayData.Eclipse) { eventName = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`; eventIconPath = ICON_PATHS.events[eventName]; } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) { eventName = dayData.Moon_Phase; eventIconPath = ICON_PATHS.events[eventName]; } if (eventName && eventIconPath) { specialEventsHtml = `<div class="special-event-row"><img src="${eventIconPath}" alt="${eventName}"><span>${eventName}</span></div>`; } const eventsContainer = document.createElement('div'); eventsContainer.classList.add('astro-events'); addEventsToCell(eventsContainer, dayData); const regularAspectsHtml = eventsContainer.innerHTML; if (specialEventsHtml || regularAspectsHtml) { html += specialEventsHtml + regularAspectsHtml; } else { html += '<p>No hay eventos ni aspectos mayores para este día.</p>'; } } else { html += '<p>No hay eventos ni aspectos mayores para este día.</p>'; } modalContent.innerHTML = html + homeButtonHtml; const closeModal = () => { modal.style.display = 'none'; }; modal.querySelector('.close-button').onclick = closeModal; modal.querySelector('.modal-home-btn').onclick = closeModal; modal.onclick = (e) => { if (e.target === modal) closeModal(); }; }
    function showInstallHelpModal() { const modal = document.getElementById('modal-install'); modal.style.display = 'flex'; const closeModal = () => { modal.style.display = 'none'; }; modal.querySelector('.close-button').onclick = closeModal; modal.onclick = (e) => { if (e.target === modal) { closeModal(); } }; }

    // =========================================================================
    // ==                           INICIALIZACIÓN                            ==
    // =========================================================================
    function initializeApp() {
        symbolBtn.addEventListener('click', showSymbolModal);
        symbolBtnMobile.addEventListener('click', showSymbolModal);
        
        // El listener original de installHelpBtn se elimina o se asegura que no cause conflicto.
        if(installHelpBtn) installHelpBtn.addEventListener('click', showInstallHelpModal);
        
        backToLandingBtn.addEventListener('click', () => {
            mobileContainer.style.display = 'none';
            backToLandingBtn.style.display = 'none';
            mobileLandingContainer.style.display = 'flex';
        });

        initDesktopView();
        initMobileView();
        initMobileLandingView();
    }
    
    initializeApp();
});