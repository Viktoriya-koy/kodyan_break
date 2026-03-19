import re

# 1. Update index.html
with open('c:/Users/Usuario/Documents/Vico/Office_Games/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('font-size: 100px;', 'font-size: 120px;')

help_icon_html = """        <div class="user-area">
            <span class="material-symbols-outlined" style="cursor:pointer; margin-right:5px; opacity:0.8; font-size:24px; color:var(--accent-color);" title="Ayuda y Funcionamiento" onclick="document.getElementById('help-modal').style.display='flex'">help</span>
            <span class="user-name" id="display-agent-name">Agente: Vico</span>"""
html = html.replace('        <div class="user-area">\n            <span class="user-name" id="display-agent-name">Agente: Vico</span>', help_icon_html)

modal_html = """
    <!-- Help Modal -->
    <div id="help-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content corporate-panel" style="width: 500px; max-width: 90%;">
            <div class="panel-header" style="background: var(--primary-color); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span style="display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">help</span> Guía del Sistema</span>
                <span class="close-btn" style="cursor: pointer; font-size: 24px; line-height: 1;" onclick="document.getElementById('help-modal').style.display='none'">×</span>
            </div>
            <div style="padding: 25px; font-size: 14px; line-height: 1.6; color: #414242; background: #fff;">
                <h4 style="margin-top:0; color:var(--primary-color); display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:18px;">dashboard</span> ¿Qué es este portal?</h4>
                <p>Bienvenido al <strong>Portal de Autogestión</strong>. Explora las carpetas corporativas para encontrar simuladores y módulos de capacitación operativos.</p>
                
                <h4 style="margin-top:20px; color:var(--primary-color); display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:18px;">sports_esports</span> Dinámica de las Aplicaciones</h4>
                <p>Al acceder a cada "sistema" (juegos), te enfrentarás a un desafío de habilidad o lógica distinto (por ejemplo, mantenimiento de servidores o conciliación de datos). Completa misiones para asegurar la continuidad operativa.</p>
                
                <h4 style="margin-top:20px; color:var(--primary-color); display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:18px;">trending_up</span> Puntos de Productividad</h4>
                <p>Tu desempeño genera <strong>Puntos de Productividad</strong> consolidados. Obtener altas puntuaciones actualizará automáticamente tu <em>Categoría</em> y <em>Evaluación</em> en la Ficha de Agente.</p>
                
                <div style="margin-top:30px; text-align:center;">
                    <button class="save-btn" style="width: auto; padding: 10px 30px;" onclick="document.getElementById('help-modal').style.display='none'">Entendido</button>
                </div>
            </div>
        </div>
    </div>
"""

html = html.replace('<!-- Modal de Configuración (Settings) -->', modal_html + '\n    <!-- Modal de Configuración (Settings) -->')

# Replace right sidebar
old_aside = """        <aside class="right-sidebar">
            <div class="widgets-container">
                <!-- Calendar Widget -->
                <div id="calendar-widget" class="calendar-widget" title="Clic para ver días hasta vacaciones">
                    <div class="cal-header" id="cal-month">ENE</div>
                    <div class="cal-body" id="cal-day">12</div>
                    <div class="cal-label" id="cal-label">HOY</div>
                </div>

                <!-- Clock Widget -->
                <div id="clock-container" class="clock-widget"
                    title="Clic: Ver tiempo restante | Doble Clic: Configurar hora">
                    <div id="clock-time">00:00:00</div>
                    <div id="clock-label">Hora Actual</div>
                </div>
            </div>
            
            <div class="weather-widget">
                <h3>San Luis Capital</h3>
                <div class="temp">24°C</div>
                <div class="desc">Soleado</div>
            </div>
        </aside>"""
new_aside = """        <aside class="right-sidebar">
            <div class="weather-widget" title="Haz clic en los textos para editar" style="cursor: text;" contenteditable="true" onblur="if(window.saveInlineWeather) saveInlineWeather();">
                <h3 id="inline-weather-title">San Luis Capital</h3>
                <div class="temp" id="inline-weather-temp">24°C</div>
                <div class="desc" id="inline-weather-desc">Soleado</div>
            </div>

            <div class="widgets-container">
                <!-- Calendar Widget -->
                <div id="calendar-widget" class="calendar-widget" title="Clic para ver días hasta vacaciones">
                    <div class="cal-header" id="cal-month">ENE</div>
                    <div class="cal-body" id="cal-day">12</div>
                    <div class="cal-label" id="cal-label">HOY</div>
                </div>

                <!-- Clock Widget -->
                <div id="clock-container" class="clock-widget"
                    title="Clic: Ver tiempo restante | Doble Clic: Configurar hora">
                    <div id="clock-time">00:00:00</div>
                    <div id="clock-label">Hora Actual</div>
                </div>
            </div>
        </aside>"""

html = html.replace(old_aside, new_aside)

with open('c:/Users/Usuario/Documents/Vico/Office_Games/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update launcher_style.css
with open('c:/Users/Usuario/Documents/Vico/Office_Games/launcher_style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('margin-top: auto;\n    padding: 25px;', 'margin-bottom: 20px;\n    padding: 25px;')
css = re.sub(r'\.weather-widget \{(.*?)margin-top: auto;(.*?)\}', r'.weather-widget {\1margin-bottom: 20px;\2}', css, flags=re.DOTALL)

with open('c:/Users/Usuario/Documents/Vico/Office_Games/launcher_style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 3. Update launcher.js
with open('c:/Users/Usuario/Documents/Vico/Office_Games/launcher.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_weather_js = """    // --- Dynamic Weather (Configurable) ---
    const weatherWidget = document.querySelector('.weather-widget');
    const weatherDesc = document.querySelector('.weather-widget .desc');
    const weatherTemp = document.querySelector('.weather-widget .temp');

    // Load saved weather or default
    const savedTemp = localStorage.getItem('vicoWeatherTemp');
    const savedDesc = localStorage.getItem('vicoWeatherDesc');

    if (savedTemp) weatherTemp.textContent = savedTemp;
    if (savedDesc) weatherDesc.textContent = savedDesc;

    weatherWidget.addEventListener('dblclick', () => {
        const newTemp = prompt("Ingrese la temperatura actual (ej: 24°C):", weatherTemp.textContent);
        if (newTemp) {
            const newDesc = prompt("Ingrese el estado del clima (ej: Soleado):", weatherDesc.textContent);
            if (newDesc) {
                weatherTemp.textContent = newTemp;
                weatherDesc.textContent = newDesc;

                localStorage.setItem('vicoWeatherTemp', newTemp);
                localStorage.setItem('vicoWeatherDesc', newDesc);
            }
        }
    });"""

new_weather_js = """    // --- Dynamic Weather (Configurable Inline) ---
    const weatherTitle = document.getElementById('inline-weather-title');
    const weatherDesc = document.getElementById('inline-weather-desc');
    const weatherTemp = document.getElementById('inline-weather-temp');

    // Load saved weather or default
    const savedTitle = localStorage.getItem('vicoWeatherTitle');
    const savedTemp = localStorage.getItem('vicoWeatherTemp');
    const savedDesc = localStorage.getItem('vicoWeatherDesc');

    if (savedTitle && weatherTitle) weatherTitle.textContent = savedTitle;
    if (savedTemp && weatherTemp) weatherTemp.textContent = savedTemp;
    if (savedDesc && weatherDesc) weatherDesc.textContent = savedDesc;

    window.saveInlineWeather = function() {
        if (weatherTitle && weatherTemp && weatherDesc) {
            localStorage.setItem('vicoWeatherTitle', weatherTitle.textContent);
            localStorage.setItem('vicoWeatherTemp', weatherTemp.textContent);
            localStorage.setItem('vicoWeatherDesc', weatherDesc.textContent);
        }
    };"""

js = js.replace(old_weather_js, new_weather_js)

with open('c:/Users/Usuario/Documents/Vico/Office_Games/launcher.js', 'w', encoding='utf-8') as f:
    f.write(js)
    
print("All files updated successfully.")
