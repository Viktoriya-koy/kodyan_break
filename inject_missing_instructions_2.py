import os
import re

base_dir = "c:/Users/Usuario/Documents/Vico/Office_Games"
needs_instr = ["salary-negotiator", "update-manager", "expediente-x", "meeting-tetris", "inbox-zero"]

def get_instr_html():
    return """
    <div id="start-screen-mod" class="overlay-screen" style="position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:99998; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;">
        <h2>Instrucciones del Simulador</h2>
        <div style="background:#fff; color:#333; padding:20px; border-radius:10px; max-width:400px; text-align:center; margin-bottom:20px;">
            <p>Deberás completar esta tarea operativa antes de que se agote el tiempo.</p>
            <p>Utiliza el ratón o el teclado para interactuar con la consola, planillas o elementos en pantalla.</p>
        </div>
        <button onclick="document.getElementById('start-screen-mod').style.display='none'" style="padding:10px 20px; font-size:18px; cursor:pointer; background:#354393; color:white; border:none; border-radius:5px; font-weight:bold;">COMENZAR TAREA</button>
    </div>
    """

for game in needs_instr:
    path = os.path.join(base_dir, game, "index.html")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
        
        if "start-screen-mod" not in html:
            if "<body" in html:
                html = re.sub(r'(<body[^>]*>)', r'\1' + get_instr_html(), html, count=1)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(html)

print("Instrucciones aplicadas a: " + ", ".join(needs_instr))
