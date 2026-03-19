import re

with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove the duplicated style block
text = re.sub(r'    <style>\s*\.folder-icon:hover \{\s*transform: translateY\(-5px\) !important;\s*\}\s*</style>\s*</head>', '</head>', text)

# 2. Fix the title and duplicated desktop-folders
# Find from <!-- SECTION 1... down to the second <div id="all-games-hidden"...
pattern2 = r'<!-- SECTION 1: PERFORMANCE.*?<div id="all-games-hidden"[^>]*>\s*<div class="grid-container" id="campaign-grid"'
desktop_folders_new = """
                <div class="desktop-folders" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 25px; width: 100%; max-width: 1000px; margin-bottom: 40px; margin-top: 20px;">
                    <div class="folder-icon" onclick="openFolder('rrhh', 'Recursos Humanos')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 100px; font-variation-settings: 'FILL' 1;">folder_shared</span></div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Recursos Humanos</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('it', 'Sistemas e Infraestructura')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 100px; font-variation-settings: 'FILL' 1;">dns</span></div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Sistemas e Infra.</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('ops', 'Operaciones')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 100px; font-variation-settings: 'FILL' 1;">folder_managed</span></div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Operaciones</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('comms', 'Comunicaciones')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 100px; font-variation-settings: 'FILL' 1;">forum</span></div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Comunicaciones</div>
                    </div>
                    <div class="folder-icon" onclick="openFolder('health', 'Salud Ocupacional')" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
                        <div style="color: var(--primary-color); margin-bottom: 10px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"><span class="material-symbols-outlined" style="font-size: 100px; font-variation-settings: 'FILL' 1;">health_and_safety</span></div>
                        <div style="font-weight: 600; color: #333; font-size: 14px; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 5px;">Salud Ocupacional</div>
                    </div>
                </div>
                
                <div id="all-games-hidden" style="display: none;">
<div class="grid-container" id="campaign-grid"
"""
text = re.sub(pattern2, desktop_folders_new, text, flags=re.DOTALL)

# 3. Fix rogue closing tags before aside
pattern3 = r'            </div>\n    </div>\n    </div>\n    </div>\n    </main>'
replacement3 = r'            </div>\n        </div>\n    </main>'
text = text.replace('            </div>\n    </div>\n    </div>\n    </div>\n    </main>', replacement3)

# 4. Remove duplicated Folder Modal
pattern4 = r'    <!-- Folder Modal -->.*?    </div>\n\n\n    <!-- Folder Modal -->'
replacement4 = r'    <!-- Folder Modal -->'
text = re.sub(pattern4, replacement4, text, flags=re.DOTALL)

with open("c:/Users/Usuario/Documents/Vico/Office_Games/index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("HTML fixed successfully.")
