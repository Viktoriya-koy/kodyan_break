import re

with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Add Material Icons CDN if not present
if "Material+Symbols" not in html:
    html = html.replace('<link rel="stylesheet" href="launcher_style.css">', 
        '<link rel="stylesheet" href="launcher_style.css">\n    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />')

# 2. Add dynamic CSS for 3x2 grid in RRHH if not present
grid_style = """
    <style>
        .folder-icon:hover {
            transform: translateY(-5px) !important;
        }
        .grid-3x2 {
            grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 768px) {
            .grid-3x2 {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
        @media (max-width: 480px) {
            .grid-3x2 {
                grid-template-columns: 1fr !important;
            }
        }
    </style>
"""
if "grid-3x2" not in html:
    html = re.sub(r'<style>[\s\S]*?\.folder-icon:hover[\s\S]*?</style>', grid_style, html)


# 3. Replace Escudo emoji
html = html.replace('<div class="escudo" id="display-escudo">🏛️</div>', 
    '<div class="escudo" id="display-escudo"><span class="material-symbols-outlined" style="font-size: 32px;">account_balance</span></div>')

# 4. Replace Wallet emoji
html = html.replace('📈 <span id="global-coins">0</span> Pts', 
    '<span class="material-symbols-outlined">trending_up</span> Productividad: <span id="global-coins">0</span> Pts')

# Fix wallet container style to be a row and adjust font-size
html = html.replace('<div class="wallet-container" style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 5px;" title="Puntos de Productividad">', 
    '<div class="wallet-container" style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 8px;" title="Puntos de Productividad">')


# 5. Replace Desktop Folders title and icons
html = re.sub(r'🖥️ Portal de Aplicaciones Corporativas', 
    '<span class="material-symbols-outlined" style="font-size: 28px; vertical-align: bottom;">grid_view</span> <span style="font-size: 20px;">Portal de Aplicaciones Corporativas</span>', html)

# Folder 1: RRHH
html = html.replace('<div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">📂</div>', 
    '<div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 70px; font-variation-settings: \'FILL\' 1;">folder_shared</span></div>')
html = html.replace("openFolder('rrhh', '📂 Recursos Humanos')", "openFolder('rrhh', 'Recursos Humanos')")

# Folder 2: IT
html = html.replace('<div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">💻</div>', 
    '<div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 70px; font-variation-settings: \'FILL\' 1;">dns</span></div>')
html = html.replace("openFolder('it', '💻 Sistemas e Infraestructura')", "openFolder('it', 'Sistemas e Infraestructura')")

# Folder 3: Ops
html = html.replace('<div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">📊</div>', 
    '<div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 70px; font-variation-settings: \'FILL\' 1;">folder_managed</span></div>')
html = html.replace("openFolder('ops', '📊 Operaciones')", "openFolder('ops', 'Operaciones')")

# Folder 4: Comms
html = html.replace('<div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">💬</div>', 
    '<div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 70px; font-variation-settings: \'FILL\' 1;">forum</span></div>')
html = html.replace("openFolder('comms', '💬 Comunicaciones')", "openFolder('comms', 'Comunicaciones')")

# Folder 5: Health
html = html.replace('<div style="font-size: 70px; margin-bottom: 10px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));">⚕️</div>', 
    '<div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 70px; font-variation-settings: \'FILL\' 1;">health_and_safety</span></div>')
html = html.replace("openFolder('health', '⚕️ Salud Ocupacional')", "openFolder('health', 'Salud Ocupacional')")


# 6. Fix modal title style
html = html.replace('<span>📂 Carpeta</span>', 
    '<span style="display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" id="folder-title-icon">folder_open</span> <span id="folder-title-text">Carpeta</span></span>')
# This requires a small update to launcher.js to set textContent of the #folder-title-text span instead.


# 7. Change specific game icons inside the cards
icon_map = {
    # Ops
    'spreadsheet': 'table_chart',
    'math': 'calculate',
    'expediente': 'folder_special',
    'papersniper': 'send',
    'printer': 'print',
    'sudoku': 'grid_on',
    'shredder': 'delete_forever',
    
    # IT
    'systemcrash': 'build_circle',
    'terminal': 'terminal',
    'git': 'account_tree',
    'sql': 'database',
    'web': 'html',
    'vpn': 'wifi_tethering',
    'update': 'security_update_good',
    'java': 'code',

    # RRHH
    'salary': 'attach_money',
    'kickboss': 'sports_martial_arts',
    'chair': 'event_seat',
    'angryinterns': 'engineering',
    'english': 'language',
    'whackboss': 'pan_tool',

    # Comms
    'tetris': 'event_available',
    'inbox': 'mail',
    'slack': 'chat',
    'mute': 'mic_off',

    # Health / Pausas
    'coffee': 'local_cafe',
    'coffeespiller': 'water_drop',
    'voodoo': 'assignment_late',
    'tabs': 'tab_unselected',
    'micromanager': 'directions_run'
}

def replace_game_icon(match):
    full_str = match.group(0)
    game_id_match = re.search(r'data-(game|arcade)="([^"]+)"', full_str)
    
    if not game_id_match:
        return full_str
        
    game_id = game_id_match.group(2)
    new_icon = icon_map.get(game_id, 'widgets')
    
    # regex to replace the emoji text inside inner div.icon
    return re.sub(r'(<div class="icon"[^>]*>)[^<]*(</div>)', f'\\1<span class="material-symbols-outlined" style="font-size: 36px;">{new_icon}</span>\\2', full_str)

html = re.sub(r'(<a [^>]+class="system-card" [^>]*>[\s\S]*?</a>)', replace_game_icon, html)


# 8. Move 'voodoo' from Health to Ops
html = html.replace('data-arcade="voodoo" data-folder="health"', 'data-arcade="voodoo" data-folder="ops"')


with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Icons replaced in index.html!")
