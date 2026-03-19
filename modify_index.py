import re

with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace Office Coins
html = html.replace('🪙 <span id="global-coins">0</span> OC', '📈 <span id="global-coins">0</span> Pts')

# Keep the global wallet display standard
html = html.replace('<div class="wallet-container" style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">', '<div class="wallet-container" style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 5px;" title="Puntos de Productividad">')

# We need to find the <a class="system-card" ...> and assign data-folder based on game or arcade id
folders_map = {
    # RRHH
    "salary": "rrhh", "kickboss": "rrhh", "chair": "rrhh", "angryinterns": "rrhh", "english": "rrhh", "whackboss": "rrhh",
    # IT
    "systemcrash": "it", "terminal": "it", "git": "it", "sql": "it", "web": "it", "vpn": "it", "update": "it", "java": "it",
    # Ops
    "spreadsheet": "ops", "math": "ops", "expediente": "ops", "papersniper": "ops", "printer": "ops", "sudoku": "ops", "shredder": "ops",
    # Comms
    "tetris": "comms", "inbox": "comms", "slack": "comms", "mute": "comms",
    # Health (Salud Ocupacional)
    "coffee": "health", "coffeespiller": "health", "voodoo": "health", "tabs": "health", "micromanager": "health"
}

def add_folder_attribute(match):
    full_match = match.group(0)
    
    # Extract ID
    game_id_match = re.search(r'data-(game|arcade)="([^"]+)"', full_match)
    if not game_id_match:
        return full_match
    
    game_id = game_id_match.group(2)
    folder = folders_map.get(game_id, "ops") # Default ops
    
    # Add data-folder attribute
    return full_match.replace('class="system-card"', f'class="system-card" data-folder="{folder}"')

# Add data-folder to all cards
html = re.sub(r'<a href="[^"]+" class="system-card" (data-[^=]+="[^"]+")>', add_folder_attribute, html)

# Replace the titles and logic
html = html.replace('📋 Objetivos de Desempeño (Prioridad Alta)', '🖥️ Portal de Aplicaciones Corporativas')
# Remove the old second title completely
html = re.sub(r'<h2 class="section-title"[^>]*>\s*☕ Herramientas de Pausa Activa \(Segundo Plano\)</h2>', '', html)

# Actually, let's inject the folders just before the campaign grid
replacement_desktop = """
                <div class="desktop-folders" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 25px; width: 100%; max-width: 1000px; margin-bottom: 40px; margin-top: 20px;">
                    <div class="folder-icon" onclick="openFolder('rrhh', '📂 Recursos Humanos')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">📂</div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Recursos Humanos</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('it', '💻 Sistemas e Infraestructura')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">💻</div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Sistemas e Infra.</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('ops', '📊 Operaciones')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">📊</div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Operaciones</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('comms', '💬 Comunicaciones')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">💬</div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Comunicaciones</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('health', '⚕️ Salud Ocupacional')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">⚕️</div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Salud Ocupacional</div>
                    </div>
                </div>
                
                <div id="all-games-hidden" style="display: none;">
"""

html = html.replace('<div class="grid-container" id="campaign-grid"', replacement_desktop + '\n<div class="grid-container" id="campaign-grid"')

# Add the modal html at the end before </body>
modal_html = """
    <!-- Folder Modal -->
    <div id="folder-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content corporate-panel" style="width: 85%; max-width: 1100px; max-height: 80vh; display: flex; flex-direction: column;">
            <div class="panel-header" id="folder-modal-title" style="font-size: 18px; padding: 15px; display: flex; justify-content: space-between; align-items: center; background: var(--primary-color); color: white;">
                <span>📂 Carpeta</span>
                <span class="close-btn" style="cursor: pointer; font-size: 24px; line-height: 1;" onclick="document.getElementById('folder-modal').style.display='none'">×</span>
            </div>
            <div class="folder-content" style="padding: 25px; overflow-y: auto; background: #f4f6f8; flex: 1;">
                <div id="folder-games-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
                    <!-- Games dynamically injected here -->
                </div>
            </div>
        </div>
    </div>
"""

# Hide the end of the hidden container
html = html.replace('</div>\n    </div>\n    </main>', '</div>\n    </div>\n    </div>\n    </main>')

html = html.replace('<!-- Modal de Configuración (Settings) -->', modal_html + '\n<!-- Modal de Configuración (Settings) -->')

# Add folder hover styles
style_insert = """
    <style>
        .folder-icon:hover {
            transform: translateY(-5px) !important;
        }
    </style>
</head>
"""
html = html.replace('</head>', style_insert)

with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("index.html modified successfully via python.")
