import os
import glob
import re

base_dir = "c:/Users/Usuario/Documents/Vico/Office_Games"

btn_html = '\n    <a href="../index.html" class="btn-return" style="position:fixed; top:15px; left:20px; background:var(--primary-color, #354393); color:white; padding:8px 15px; text-decoration:none; border-radius:8px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.2); z-index:99999;">🔙 Regresar al Portal</a>\n'

# 1. Force Inject "Volver" button
needs_btn = ["system-crash", "update-manager", "sudoku", "printer-panic", "expediente-x", "meeting-tetris", "mute-all"]

for game in needs_btn:
    path = os.path.join(base_dir, game, "index.html")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
            
        if "🔙 Regresar al Portal" not in html and "🔙 Volver al Portal" not in html:
            if "<body" in html:
                html = re.sub(r'(<body[^>]*>)', r'\1' + btn_html, html, count=1)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(html)

# 2. Inject Missing Instructions
needs_instr = ["angry-interns", "java-corp", "vpn-tuner", "printer-panic", "mute-all", "tab-hoarder", "voodoo-ticket"]

def get_instr_html():
    return """
    <div id="start-screen-mod" class="overlay-screen" style="position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:99998; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;">
        <h2>Instrucciones del Simulador</h2>
        <div style="background:#fff; color:#333; padding:20px; border-radius:10px; max-width:400px; text-align:center; margin-bottom:20px;">
            <p>Deberás completar esta tarea corporativa demostrando tu proactividad y sinergia.</p>
            <p>Utiliza el ratón o el teclado según corresponda para interactuar con la consola, formularios o elementos en pantalla.</p>
        </div>
        <button onclick="document.getElementById('start-screen-mod').style.display='none'" style="padding:10px 20px; font-size:18px; cursor:pointer; background:#354393; color:white; border:none; border-radius:5px; font-weight:bold;">COMENZAR TAREA</button>
    </div>
    """

for game in needs_instr:
    path = os.path.join(base_dir, game, "index.html")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
        
        # We check both the old default start-screen and our new start-screen-mod
        if "start-screen" not in html and "Instrucciones" not in html and "start-screen-mod" not in html:
            if "<body" in html:
                html = re.sub(r'(<body[^>]*>)', r'\1' + get_instr_html(), html, count=1)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(html)

# 3. Deep Translation
needs_trans = ["english-class", "salary-negotiator", "terminal-tycoon", "db-admin", "spreadsheet-saga", "secure-delete"]

translations = {
    "Score:": "Puntuación:",
    "Score": "Puntuación",
    "Time:": "Tiempo:",
    "Time": "Tiempo",
    "Level:": "Nivel:",
    "Level": "Nivel",
    "Game Over": "Fin del Juego",
    "Press any key": "Presiona cualquier tecla",
    "Start": "Comenzar",
    "Play": "Jugar"
}

for game in needs_trans:
    game_dir = os.path.join(base_dir, game)
    for ext in ["*.html", "*.js"]:
        for fpath in glob.glob(os.path.join(game_dir, ext)):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            
            modified = False
            for eng, span in translations.items():
                if f">{eng}<" in content or f'"{eng}"' in content or f"'{eng}'" in content or (":" in eng and eng in content):
                    content = content.replace(f">{eng}<", f">{span}<")
                    content = content.replace(f'"{eng}"', f'"{span}"')
                    content = content.replace(f"'{eng}'", f"'{span}'")
                    if ":" in eng:
                        content = content.replace(eng, span)
                    modified = True
            
            # Safe regex for visible text between tags
            newTitle = re.sub(r'>\s*Score\s*<', '>Puntuación<', content)
            if newTitle != content:
                content = newTitle
                modified = True
            
            newTitle2 = re.sub(r'>\s*Game Over\s*<', '>Fin del Juego<', content)
            if newTitle2 != content:
                content = newTitle2
                modified = True
                
            newTitle3 = re.sub(r'>\s*Level\s*<', '>Nivel<', content)
            if newTitle3 != content:
                content = newTitle3
                modified = True

            if modified:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(content)

print("Targeted manual fixes deployed successfully.")
