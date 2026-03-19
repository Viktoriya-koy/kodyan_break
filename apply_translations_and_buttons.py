import os
import glob
import re

base_dir = "c:/Users/Usuario/Documents/Vico/Office_Games"

games = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

translations = {
    # paper-sniper / angry-interns
    "Drag mouse left to pull back. Release to launch.": "Arrastra el ratón hacia la izquierda para apuntar. Suelta para lanzar.",
    "Click anywhere while flying to RELOAD instantly.": "Haz clic en cualquier parte mientras vuela para RECARGAR al instante.",
    "Targets:": "Objetivos:",
    "Managers": "Jefes",
    "Files": "Archivos",
    "Water": "Agua",
    # general
    "Game Over": "Fin del Juego",
    "Score:": "Puntos:",
    "Time:": "Tiempo:",
    "Level:": "Nivel:"
}

btn_html = '\n    <a href="../index.html" class="btn-return" style="position:fixed; top:15px; right:20px; background:var(--primary-color, #354393); color:white; padding:8px 15px; text-decoration:none; border-radius:8px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.2); z-index:99999;">🔙 Volver al Portal</a>\n'

for game in games:
    game_dir = os.path.join(base_dir, game)
    index_path = os.path.join(game_dir, "index.html")
    
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()
            
        modified = False
        
        # 1. Check/Add Volver button
        has_return = ("../index.html" in html) or ("Volver" in html) or ("🔙" in html)
        if not has_return:
            # Inject right inside <body>
            if "<body" in html:
                html = re.sub(r'(<body[^>]*>)', r'\1' + btn_html, html, count=1)
                modified = True
                
        # 2. Translations in HTML
        for eng, span in translations.items():
            if eng in html:
                html = html.replace(eng, span)
                modified = True

        # Special casing for kick-the-boss missing instructions
        if game == "kick-the-boss" and "Instrucciones" not in html and "cómo jugar" not in html.lower() and "overlay-screen" not in html:
            instr_html = """
            <div id="start-screen" class="overlay-screen" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:50; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;">
                <h2>Instrucciones</h2>
                <div style="background:#fff; color:#333; padding:20px; border-radius:10px; max-width:400px; text-align:center; margin-bottom:20px;">
                    <p>¡Libera tu estrés arrastrando al muñeco y dándole una paliza virtual!</p>
                    <p>Haz clic y arrástralo rápidamente para hacerlo volar por la oficina.</p>
                </div>
                <button onclick="document.getElementById('start-screen').style.display='none'" style="padding:10px 20px; font-size:18px; cursor:pointer; background:#e01e5a; color:white; border:none; border-radius:5px;">COMENZAR TERAPIA</button>
            </div>
            """
            # Insert into game-container or body
            if '<div class="game-container">' in html:
                 html = html.replace('<div class="game-container">', '<div class="game-container">' + instr_html, 1)
            elif '<body' in html:
                 html = re.sub(r'(<body[^>]*>)', r'\1' + instr_html, html, count=1)
            modified = True
                
        if modified:
            with open(index_path, "w", encoding="utf-8") as f:
                f.write(html)
                
    # 3. Translations in JS files
    for js_path in glob.glob(os.path.join(game_dir, "*.js")):
        with open(js_path, "r", encoding="utf-8") as f:
            js = f.read()
        
        modified_js = False
        for eng, span in translations.items():
            if eng in js:
                js = js.replace(eng, span)
                modified_js = True
                
        if modified_js:
            with open(js_path, "w", encoding="utf-8") as f:
                f.write(js)

print("Automated fix deployed successfully across all games.")
