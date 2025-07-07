document.addEventListener('DOMContentLoaded', () => {
    const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const FASES_LUNARES_PRINCIPALES = ['Luna Nueva', 'Cuarto Creciente', 'Luna Llena', 'Cuarto Menguante'];

    const ICON_PATHS = {
        planets: { 'Sun': 'assets/planets/Sun.png', 'Moon': 'assets/planets/Moon.png', 'Mercury': 'assets/planets/Mercury.png', 'Venus': 'assets/planets/Venus.png', 'Mars': 'assets/planets/Mars.png', 'Jupiter': 'assets/planets/Jupiter.png', 'Saturn': 'assets/planets/Saturn.png', 'Uranus': 'assets/planets/Uranus.png', 'Neptune': 'assets/planets/Neptune.png', 'Pluto': 'assets/planets/Pluto.png', 'Chiron': 'assets/planets/Chiron.png', 'North Node': 'assets/planets/North_Node.png','South Node': 'assets/planets/South_Node.png', 'Pars Fortuna': 'assets/planets/Pars_Fortuna.png' },
        signs: { 'Aries': 'assets/signs/Aries.png', 'Taurus': 'assets/signs/Taurus.png', 'Gemini': 'assets/signs/Gemini.png', 'Cancer': 'assets/signs/Cancer.png', 'Leo': 'assets/signs/Leo.png', 'Virgo': 'assets/signs/Virgo.png', 'Libra': 'assets/signs/Libra.png', 'Scorpio': 'assets/signs/Scorpio.png', 'Sagittarius': 'assets/signs/Sagittarius.png', 'Capricorn': 'assets/signs/Capricorn.png', 'Aquarius': 'assets/signs/Aquarius.png', 'Pisces': 'assets/signs/Pisces.png' },
        aspects: { 'Conjunction': 'assets/aspects/Conjunction.png', 'Opposition': 'assets/aspects/Opposition.png', 'Trine': 'assets/aspects/Trine.png', 'Square': 'assets/aspects/Square.png', 'Sextile': 'assets/aspects/Sextile.png', 'Retrograde': 'assets/aspects/Retrograde.png' },
        events: {'Luna Nueva': 'assets/aspects/Luna Nueva.png','Cuarto Creciente': 'assets/aspects/Cuarto Creciente.png','Luna Llena': 'assets/aspects/Luna Llena.png','Cuarto Menguante': 'assets/aspects/Cuarto Menguante.png','Eclipse Lunar Total': 'assets/aspects/Eclipse Lunar Total.png','Eclipse Solar Total': 'assets/aspects/Eclipse Solar Total.png','Eclipse Lunar Partial': 'assets/aspects/Eclipse Lunar Parcial.png','Eclipse Solar Partial': 'assets/aspects/Eclipse Solar Parcial.png','Eclipse Lunar Anular': 'assets/aspects/Eclipse Lunar Anular.png','Eclipse Solar Anular': 'assets/aspects/Eclipse Solar Anular.png'},
        alerts: { 'Warning': 'assets/aspects/warning.gif' }
    };

    const calendarContainer = document.getElementById('calendar-container');
    const calendarTitle = document.querySelector('#calendar-header h1');

    const selectMonth = document.getElementById('select-month');
    const selectYear = document.getElementById('select-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const printBtn = document.getElementById('print-btn');
    const downloadBtn = document.getElementById('download-btn');

    let selectedYear, selectedMonth;
    const MIN_YEAR = 2020;
    const MAX_YEAR = 2030;

    function setTodayAsDefault() {
        const now = new Date();
        selectedYear = now.getFullYear();
        selectedMonth = now.getMonth() + 1;
    }

    function fillControls() {
        selectMonth.innerHTML = NOMBRES_MESES.map((mes, idx) =>
            `<option value="${idx + 1}">${mes}</option>`).join('');
        selectMonth.value = selectedMonth;

        let yearOptions = '';
        for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
            yearOptions += `<option value="${y}">${y}</option>`;
        }
        selectYear.innerHTML = yearOptions;
        selectYear.value = selectedYear;
    }

    prevMonthBtn.addEventListener('click', () => {
        selectedMonth--;
        if (selectedMonth < 1) {
            selectedMonth = 12;
            selectedYear--;
        }
        if (selectedYear < MIN_YEAR) {
            selectedYear = MIN_YEAR;
            selectedMonth = 1;
        }
        fillControls();
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        selectedMonth++;
        if (selectedMonth > 12) {
            selectedMonth = 1;
            selectedYear++;
        }
        if (selectedYear > MAX_YEAR) {
            selectedYear = MAX_YEAR;
            selectedMonth = 12;
        }
        fillControls();
        updateCalendar();
    });

    selectMonth.addEventListener('change', () => {
        selectedMonth = parseInt(selectMonth.value);
        updateCalendar();
    });

    selectYear.addEventListener('change', () => {
        selectedYear = parseInt(selectYear.value);
        updateCalendar();
    });

    printBtn.addEventListener('click', () => window.print());

    downloadBtn.addEventListener('click', () => {
        html2canvas(calendarContainer).then(canvas => {
            const link = document.createElement('a');
            link.download = `Calendario-Astral.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    async function updateCalendar() {
        try {
            const yearStr = selectedYear.toString();
            const monthStr = selectedMonth.toString().padStart(2, '0');
            const response = await fetch(`Calendar/${yearStr}/astro_data_${yearStr}_${monthStr}.json`);
            if (!response.ok) throw new Error('No se pudo cargar el archivo astro_data.json');
            const allData = await response.json();
            //console.log("✅ Datos JSON cargados:", monthData);
            const yearData = allData[selectedYear];
            if (!yearData) throw new Error(`No hay datos para el año ${selectedYear}`);
            const monthData = yearData[selectedMonth];
            if (!monthData) throw new Error(`No hay datos para el mes ${NOMBRES_MESES[selectedMonth-1]}`);
            calendarTitle.textContent = `Calendario Astral - ${NOMBRES_MESES[selectedMonth-1]} ${selectedYear}`;
            buildCalendar(monthData, selectedYear, selectedMonth);
        } catch (error) {
            calendarContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    // Aquí van tus funciones buildCalendar, addEventsToCell y createEventRow
    // (COPIA Y PEGA AQUÍ EL CÓDIGO ORIGINAL DE ESAS FUNCIONES, NO CAMBIA)

    setTodayAsDefault();
    fillControls();
    updateCalendar();



    function buildCalendar(data, year, month) {
        // ... (el código de esta función no cambia)
        calendarContainer.innerHTML = '';
        DIAS_SEMANA.forEach(day => {
            const headerCell = document.createElement('div');
            headerCell.classList.add('calendar-cell', 'day-header');
            headerCell.textContent = day;
            calendarContainer.appendChild(headerCell);
        });
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const emptyCells = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < emptyCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty-cell');
            calendarContainer.appendChild(emptyCell);
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dayData = data[String(dayNum)] || {};
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-cell');
            let eventCount = 0;
            if (dayData.Moon) eventCount++;
            if (dayData.Retrograde_Changes) eventCount += dayData.Retrograde_Changes.length;
            if (dayData.Aspects) {
                for (const p1 in dayData.Aspects) {
                    eventCount += Object.keys(dayData.Aspects[p1]).length;
                }
            }
            if (eventCount >= 4) {
                const warningIcon = document.createElement('img');
                warningIcon.src = ICON_PATHS.alerts.Warning;
                warningIcon.classList.add('warning-icon');
                dayCell.appendChild(warningIcon);
            }
            const dayTitleContainer = document.createElement('div');
            dayTitleContainer.classList.add('day-title-container');
            const dateNumber = document.createElement('div');
            dateNumber.classList.add('date-number');
            if (new Date(year, month - 1, dayNum).getDay() === 0) dateNumber.classList.add('sunday');
            dateNumber.textContent = dayNum;
            dayTitleContainer.appendChild(dateNumber);
            if (dayData.Eclipse) {
                const eclipseKey = `Eclipse ${dayData.Eclipse.type} ${dayData.Eclipse.subtype}`;
                const path = ICON_PATHS.events[eclipseKey];
                if (!path) {
                    console.warn(`❌ No se encontró imagen para eclipseKey: ${eclipseKey}`);
                    }

                if (path) {
                    const icon = document.createElement('img');
                    icon.src = path;
                    icon.classList.add('day-event-icon');
                    dayTitleContainer.appendChild(icon);
                }
            } else if (FASES_LUNARES_PRINCIPALES.includes(dayData.Moon_Phase)) {
                const path = ICON_PATHS.events[dayData.Moon_Phase];
                if (path) {
                    const icon = document.createElement('img');
                    icon.src = path;
                    icon.classList.add('day-event-icon');
                    dayTitleContainer.appendChild(icon);
                }
            }
            dayCell.appendChild(dayTitleContainer);
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('astro-events');
            addEventsToCell(eventsContainer, dayData);
            dayCell.appendChild(eventsContainer);
            calendarContainer.appendChild(dayCell);
        }
    }

    function addEventsToCell(container, dayData) {
    if (dayData.Moon) {
        const showsArrow = dayData.Moon.includes('CHANGE');
        const moonSign = dayData.Moon.replace('CHANGE ', '');
        let eventItems = [];
        if (showsArrow) {
            eventItems = [
                { category: 'planets', name: 'Moon' },
                { type: 'text', value: '→' },
                { category: 'signs', name: moonSign }
            ];
        } else {
            eventItems = [
                { category: 'planets', name: 'Moon' },
                { category: 'signs', name: moonSign }
            ];
        }
        container.appendChild(createEventRow(eventItems));
    }

    if (dayData.Retrograde_Changes && dayData.Retrograde_Changes.length > 0) {
        dayData.Retrograde_Changes.forEach(change => {
            let eventItems = [];
            if (change.status === 'retrograde') {
                eventItems = [
                    { category: 'planets', name: change.planet },
                    { type: 'text', value: '→' },
                    { category: 'aspects', name: 'Retrograde' }
                ];
            } else if (change.status === 'direct') {
                eventItems = [
                    { category: 'aspects', name: 'Retrograde' },
                    { type: 'text', value: '→' },
                    { category: 'planets', name: change.planet }
                ];
            }
            if (eventItems.length > 0) {
                container.appendChild(createEventRow(eventItems));
            }
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

                // Verifica que p2 también sea una cadena válida (evita undefined)
                container.appendChild(createEventRow([
                    { category: 'planets', name: p1 },
                    { category: 'signs', name: aspectData.planet1_sign, isSmall: true },
                    { category: 'aspects', name: aspectData.type },
                    { category: 'planets', name: p2 },
                    { category: 'signs', name: aspectData.planet2_sign, isSmall: true }
                ]));
            }
        }
    }
}

    
    function createEventRow(items) {
        // ... (el código de esta función no cambia)
        const row = document.createElement('div');
        row.classList.add('event-row');
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
                    if (item.isSmall) img.classList.add('sign-icon-small');
                    else img.classList.add(`${item.category}-icon`);
                    row.appendChild(img);
                } else {
                    console.warn(`No se encontró la ruta para: category=${item.category}, name=${item.name}`);
                }
            }
        });
        return row;
    }

    setTodayAsDefault();
    fillControls();
    updateCalendar()
    ;initCalendar();
});

