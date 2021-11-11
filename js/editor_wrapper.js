// ##### EDITOR_WRAPPER.js #####
// For managing multiple sessions/tabs of ace editors
// from one object exposed in main.js. Also exposes
// common operations provided by the ace editor

class EditorWrapper {
    constructor(_container, state, EDITORS) {

        this.EDITORS = EDITORS;
        this._container = _container;

        // New editor, find a unique ID for it. At this point, a new editor can only
        // spawn on first page creation or button click, all or no editors should exist
        // by now
        this.ID = 0;
        if (state.id == -1 || state.id == undefined) {
            while (this.ID in this.EDITORS) {
                this.ID = this.ID + 1;
            }
        } else {
            this.ID = state.id;
        }

        this.EDITORS[this.ID] = this;


        this.HEADER_TOOLBAR_DIV = document.createElement("div");
        this.HEADER_TOOLBAR_DIV.classList.add("editor_header_toolbar");
        this._container.element.appendChild(this.HEADER_TOOLBAR_DIV);



        this.FILE_BUTTON = document.createElement("button");
        this.FILE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.FILE_BUTTON.textContent = "File\u25BE";
        this.FILE_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: File operations for PC and Thumby");
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_BUTTON);

        this.FILE_DROPDOWN = document.createElement("div");
        this.FILE_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0");
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_DROPDOWN);

        this.FILE_DROPDOWN_UL = document.createElement("div");
        this.FILE_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.FILE_DROPDOWN.appendChild(this.FILE_DROPDOWN_UL);

        var listElem = document.createElement("li");
        this.FILE_EXPORT_BUTTON = document.createElement("button");
        this.FILE_EXPORT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_EXPORT_BUTTON.textContent = "Export to PC";
        this.FILE_EXPORT_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Export editor contents to file on PC");
        this.FILE_EXPORT_BUTTON.onclick = () => { this.exportFileAs() }
        listElem.appendChild(this.FILE_EXPORT_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_IMPORT_BUTTON = document.createElement("button");
        this.FILE_IMPORT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_IMPORT_BUTTON.textContent = "Import from PC";
        this.FILE_IMPORT_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Import editor contents from file on PC");
        this.FILE_IMPORT_BUTTON.onclick = () => { this.openFile() }
        listElem.appendChild(this.FILE_IMPORT_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_SAVE_BUTTON = document.createElement("button");
        this.FILE_SAVE_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_SAVE_BUTTON.textContent = "Save to Thumby";
        this.FILE_SAVE_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Save editor contents to file on Thumby (ctrl-s)");
        this.FILE_SAVE_BUTTON.onclick = () => { this.onSaveToThumby() };
        listElem.appendChild(this.FILE_SAVE_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_SAVEAS_BUTTON = document.createElement("button");
        this.FILE_SAVEAS_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_SAVEAS_BUTTON.textContent = "Save As to Thumby";
        this.FILE_SAVEAS_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Save editor contents to file on Thumby under a specific path");
        this.FILE_SAVEAS_BUTTON.onclick = () => { this.onSaveAsToThumby() };
        listElem.appendChild(this.FILE_SAVEAS_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        listElem.classList = "uk-nav-divider";
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_EXAMPLES_BUTTON = document.createElement("button");
        this.FILE_EXAMPLES_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_EXAMPLES_BUTTON.textContent = "Examples\u25BE";
        this.FILE_EXAMPLES_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Various MicroPython examples");
        listElem.appendChild(this.FILE_EXAMPLES_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);


        this.EXAMPLES_DROPDOWN_DIV = document.createElement("div");
        this.EXAMPLES_DROPDOWN_DIV.setAttribute("uk-dropdown", "offset: 0");
        this.FILE_DROPDOWN_UL.appendChild(this.EXAMPLES_DROPDOWN_DIV);

        this.EXAMPLES_DROPDOWN_UL = document.createElement("ul");
        this.EXAMPLES_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.EXAMPLES_DROPDOWN_DIV.appendChild(this.EXAMPLES_DROPDOWN_UL);


        listElem = document.createElement("li");
        this.ANNELID_EXAMPLE_BTN = document.createElement("button");
        this.ANNELID_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.ANNELID_EXAMPLE_BTN.textContent = "Annelid";
        this.ANNELID_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/Games/Annelid/Annelid.py")) };
        listElem.appendChild(this.ANNELID_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.THUMGEON_EXAMPLE_BTN = document.createElement("button");
        this.THUMGEON_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.THUMGEON_EXAMPLE_BTN.textContent = "Thumgeon";
        this.THUMGEON_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/Games/Thumgeon/Thumgeon.py")) };
        listElem.appendChild(this.THUMGEON_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.SAURRUN_EXAMPLE_BTN = document.createElement("button");
        this.SAURRUN_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.SAURRUN_EXAMPLE_BTN.textContent = "SaurRun";
        this.SAURRUN_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/Games/SaurRun/SaurRun.py")) };
        listElem.appendChild(this.SAURRUN_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.SPACEDEBRIS_EXAMPLE_BTN = document.createElement("button");
        this.SPACEDEBRIS_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.SPACEDEBRIS_EXAMPLE_BTN.textContent = "SpaceDebris";
        this.SPACEDEBRIS_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/Games/SpaceDebris/SpaceDebris.py")) };
        listElem.appendChild(this.SPACEDEBRIS_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.TINYBLOCKS_EXAMPLE_BTN = document.createElement("button");
        this.TINYBLOCKS_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.TINYBLOCKS_EXAMPLE_BTN.textContent = "TinyBlocks";
        this.TINYBLOCKS_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/Games/TinyBlocks/TinyBlocks.py")) };
        listElem.appendChild(this.TINYBLOCKS_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.THUMBYPY_EXAMPLE_BTN = document.createElement("button");
        this.THUMBYPY_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.THUMBYPY_EXAMPLE_BTN.textContent = "thumby.py";
        this.THUMBYPY_EXAMPLE_BTN.onclick = async () => { this.openFileContents(await window.downloadFile("/ThumbyGames/lib/thumby.py")) };
        listElem.appendChild(this.THUMBYPY_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);


        this.VIEW_BUTTON = document.createElement("button");
        this.VIEW_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.VIEW_BUTTON.textContent = "View\u25BE";
        this.VIEW_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: View settings");
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_BUTTON);

        this.VIEW_DROPDOWN = document.createElement("div");
        this.VIEW_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0");
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_DROPDOWN);

        this.VIEW_DROPDOWN_UL = document.createElement("div");
        this.VIEW_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.VIEW_DROPDOWN.appendChild(this.VIEW_DROPDOWN_UL);

        listElem = document.createElement("li");
        this.VIEW_INC_FONT_BUTTON = document.createElement("button");
        this.VIEW_INC_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_INC_FONT_BUTTON.textContent = "Increase Font";
        this.VIEW_INC_FONT_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Increase editor font size");
        this.VIEW_INC_FONT_BUTTON.onclick = () => { this.increaseFontSize() };
        listElem.appendChild(this.VIEW_INC_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_DEC_FONT_BUTTON = document.createElement("button");
        this.VIEW_DEC_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_DEC_FONT_BUTTON.textContent = "Decrease Font";
        this.VIEW_DEC_FONT_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Decrease editor font size");
        this.VIEW_DEC_FONT_BUTTON.onclick = () => { this.decreaseFontSize() };
        listElem.appendChild(this.VIEW_DEC_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_RESET_FONT_BUTTON = document.createElement("button");
        this.VIEW_RESET_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_RESET_FONT_BUTTON.textContent = "Reset Font Size";
        this.VIEW_RESET_FONT_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Reset font to default");
        this.VIEW_RESET_FONT_BUTTON.onclick = () => { this.resetFontSize() };
        listElem.appendChild(this.VIEW_RESET_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_AUTOCOMPLETE_BUTTON = document.createElement("button");
        this.VIEW_AUTOCOMPLETE_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete ...";
        this.VIEW_AUTOCOMPLETE_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: When turned off, basic autocomplete can be accessed using left-ctrl + space. Affects all editors");
        this.VIEW_AUTOCOMPLETE_BUTTON.onclick = () => { this.toggleAutocompleteStateForAll() };
        listElem.appendChild(this.VIEW_AUTOCOMPLETE_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);


        this.FAST_EXECUTE_BUTTON = document.createElement("button");
        this.FAST_EXECUTE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.FAST_EXECUTE_BUTTON.textContent = "\u21bb Fast Execute";
        this.FAST_EXECUTE_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Execute editor contents at root '/' of Thumby");
        this.FAST_EXECUTE_BUTTON.onclick = () => { this.onFastExecute(this.getValue()) };
        this.HEADER_TOOLBAR_DIV.appendChild(this.FAST_EXECUTE_BUTTON);


        this.EMULATE_BUTTON = document.createElement("button");
        this.EMULATE_BUTTON.id = "emulate_button";
        this.EMULATE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.EMULATE_BUTTON.textContent = "Emulate";
        this.EMULATE_BUTTON.setAttribute("uk-tooltip", "delay: 500; pos: bottom-left; offset: 0; title: Run editor contents in emulator");
        this.EMULATE_BUTTON.onclick = () => { this.onEmulate(this.getValue()) };
        this.HEADER_TOOLBAR_DIV.appendChild(this.EMULATE_BUTTON);


        this.EDITOR_DIV = document.createElement("div");
        this.EDITOR_DIV.id = "IDEditorDiv" + this.ID;
        this.EDITOR_DIV.classList.add("editor");
        this._container.element.appendChild(this.EDITOR_DIV);


        // // Listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.resize.bind(this));

        // Listen for layout resize event and re-fit terminal
        this._container._layoutManager.on('stateChanged', () => {
            this.resize();

            // https://github.com/golden-layout/golden-layout/issues/324
            // Remove editor close button functionality and override it
            var oldElem = this._container._tab._closeElement;
            if (oldElem != null && oldElem.parentNode != null) {
                var newElem = oldElem.cloneNode(true);
                oldElem.parentNode.replaceChild(newElem, oldElem);

                newElem.onclick = () => {

                    if (this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to close this editor?')) {
                        return;
                    }

                    delete EDITORS[this.ID];
                    this.clearStorage();
                    console.log("Cleared info for Editor: " + this._container.title);
                    this._container.close();
                }
            }
        });

        // Used for setting the active editor outside this module, typically for bit map builder
        this.onFocus = undefined;
        this.onSaveToThumby = undefined;
        this.onSaveAsToThumby = undefined;
        this.onFastExecute = undefined;
        this.onEmulate = undefined;

        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
            this.onFocus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
            this.onFocus();
        });


        var defaultCode = `
import thumby
import time
import machine
import math
import random

machine.freq(125000000)

def wait(ms):
    last_update = time.ticks_ms()
    while True:
        if time.ticks_ms() - last_update > ms:
            break
        
def debug(bonus):
    thumby.display.fillRect(22, 13, 28, 13, 0)
    thumby.display.drawText(f"{bonus}", 24, 16, 1)
    thumby.display.update()
    # wait(1000)

skip_opening = False

def getcharinputNew():
    if(thumby.buttonL.justPressed()):
        return 'L'
    if(thumby.buttonR.justPressed()):
        return 'R'
    if(thumby.buttonU.justPressed()):
        return 'U'
    if(thumby.buttonD.justPressed()):
        return 'D'
    if(thumby.buttonA.justPressed()):
        return '1'
    if(thumby.buttonB.justPressed()):
        return '2'
    return ' '

# BITMAP: width: 72, height: 40
map_image_1 = (0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,
            0,0,0,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,248,248,248,248,248,248,248,248,248,248,0,0,0,255,255,255,255,255,255,255,248,248,248,255,255,255,255,255,255,255,0,0,0,248,248,248,248,248,248,248,248,248,248,255,255,255,255,255,255,255,248,248,
            224,224,224,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,3,3,
            15,15,15,255,255,255,255,255,255,255,143,143,143,143,143,143,143,143,143,143,128,128,128,143,143,143,143,143,143,143,143,143,143,255,255,255,255,255,255,255,128,128,128,143,143,143,143,143,143,143,143,143,143,255,255,255,255,255,255,255,128,128,128,255,255,255,255,255,255,255,0,0,
            0,0,0,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,0,0)

# BITMAP: width: 72, height: 40
map_image_2 = (0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,
            0,0,0,255,255,255,255,255,255,255,0,0,0,248,248,248,248,248,248,248,248,248,248,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,248,248,248,248,248,248,248,248,248,248,0,0,0,248,248,248,248,248,248,248,248,248,248,255,255,255,255,255,255,255,0,0,
            0,0,0,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,224,224,224,255,255,255,255,255,255,255,3,3,3,255,255,255,255,255,255,255,0,0,
            192,192,192,255,255,255,255,255,255,255,143,143,143,143,143,143,143,143,143,143,128,128,128,143,143,143,143,143,143,143,143,143,143,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,143,143,143,143,143,143,143,143,143,143,128,128,128,255,255,255,255,255,255,255,128,128,
            63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,0,0,0,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63)

# BITMAP: width: 72, height: 40
map_image_3 = (0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,0,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,0,0,
            248,248,248,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,248,248,248,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,248,248,248,255,255,255,255,255,255,255,248,248,248,248,248,248,248,248,248,248,248,248,248,255,255,255,255,255,255,255,0,0,
            3,3,3,255,255,255,255,255,255,255,224,224,224,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,224,224,224,255,255,255,255,255,255,255,3,3,3,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,227,3,3,3,255,255,255,255,255,255,255,224,224,
            0,0,0,255,255,255,255,255,255,255,143,143,143,143,143,143,143,143,143,143,143,143,143,255,255,255,255,255,255,255,15,15,15,255,255,255,255,255,255,255,128,128,128,255,255,255,255,255,255,255,15,15,15,255,255,255,255,255,255,255,128,128,128,255,255,255,255,255,255,255,15,15,
            0,0,0,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,0,0,0,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,0,0,0,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,63,0,0)

maze_images = (map_image_1, map_image_2, map_image_3)

# BITMAP: width: 7, height: 7
pac_image = (99,65,0,0,0,65,99)

# BITMAP: width: 7, height: 7
pac_image_R = (99,65,0,8,28,93,127)

# BITMAP: width: 7, height: 7
pac_image_D = (99,65,112,120,112,65,99)

# BITMAP: width: 7, height: 7
pac_image_L = (127,93,28,8,0,65,99)

# BITMAP: width: 7, height: 7
pac_image_U = (99,65,7,15,7,65,99)

# BITMAP: width: 7, height: 7
ghost_D = (1,64,8,0,72,1,3)

# BITMAP: width: 7, height: 7
ghost_R = (1,64,4,0,68,1,3)

# BITMAP: width: 7, height: 7
ghost_L = (3,1,68,0,4,64,1)

# BITMAP: width: 7, height: 7
ghost_U = (3,1,66,0,2,64,1)

# BITMAP: width: 15, height: 14
pac_large_1 = (224,248,252,254,254,255,255,255,255,255,254,254,252,248,224,
            1,7,15,31,31,63,63,63,63,63,31,31,15,7,1)

# BITMAP: width: 15, height: 14
pac_large_2 = (224,248,252,254,254,255,255,255,127,127,62,62,28,24,0,
            1,7,15,31,31,63,63,63,63,62,30,28,12,0,0)

# BITMAP: width: 5, height: 5
power_ball = (17,0,4,0,17)
            
player_offset = (3, 1)

last_update = time.ticks_ms()
last_opening_action = time.ticks_ms()
last_ghost_update = time.ticks_ms()

class pico_pac:
    state = 0
    x = 0 + player_offset[0]
    y = 0 + player_offset[1]
    direction = 'R'
    moving = False
    tileX = 0
    tileY = 0

class ghost_class:
    def __init__(self):
        self.scared = False
        self.x = 60 + player_offset[0]
        self.y = 39 + player_offset[1]
        self.direction = 'U'
        self.moving = True
        self.tileX = 0
        self.tileY = 0

opening_x = None
opening_state = None
player_lives = None
player_score = None
ghost_speed = None
pac = None
ghost_1 = None
ghost_2 = None
ghost_3 = None
ghosts = None
top_row_array = [0,1,1,1,1,1,1,1,1,1,1,1,0]
row_array = [1,1,1,1,1,1,1,1,1,1,1,1,1]
ball_array = None
balls_eaten = None
level = None
power_ball_1 = None
power_ball_2 = None
power_time = None
ghost_state = None
ghost_entering = None
ghost_multiplier = None
extra_life_score = None
maze_index = None

def reset_players():
    global pac
    global ghost_1
    global ghost_2
    global ghost_3
    global ghosts
    global ghost_entering
    global ghost_multiplier
    pac = pico_pac()
    ghost_1 = ghost_class()
    ghost_2 = ghost_class()
    ghost_3 = ghost_class()
    ghost_entering = False
    ghost_multiplier = 0
    if level > 9:
        ghosts = (ghost_1, ghost_2, ghost_3)
    else:
        ghosts = (ghost_1, ghost_2)
    multiplier = 0
    for ghost in ghosts:
        multiplier += 1
        ghost.y += multiplier * 10
    
def reset_balls():
    global ball_array
    global balls_eaten
    global power_ball_1
    global power_ball_2
    global power_time
    ball_array = [top_row_array.copy()]
    for i in range (0, 5):
        ball_array.append(row_array.copy())
    ball_array.append(top_row_array.copy())
    ball_array[6][12] = 1
    balls_eaten = 0
    power_ball_1 = True
    power_ball_2 = True
    power_time = 0

def init_state():
    global player_lives
    global player_score
    global ghost_speed
    global level
    global ghost_state
    global extra_life_score
    global maze_index
    player_lives = 3
    player_score = 0
    ghost_speed = 70 # The higher, the slower
    level = 1
    reset_players()
    reset_balls()
    ghost_state = 0
    extra_life_score = 10000
    maze_index = 0

init_state()

class maze:
    def __init__(self):
        # These are walls between player tiles.
        self.walls_right = []
        self.walls_down = []
        # These are the side portals in the walls [left-tileY, right-tileY]
        self.walls_portal = []
    
maze_1 = maze()

maze_1.walls_right.append([4])
maze_1.walls_right.append([1, 3, 5])
maze_1.walls_right.append([2, 4, 6])
maze_1.walls_right.append([])

maze_1.walls_down = [[]]
maze_1.walls_down.append([3])
maze_1.walls_down.append([1,3])
maze_1.walls_down.append([])
maze_1.walls_down.append([3])
maze_1.walls_down.append([1])
maze_1.walls_down.append([])

maze_1.walls_portal = [2, 1]

maze_2 = maze()

maze_2.walls_right.append([3])
maze_2.walls_right.append([1, 3, 5])
maze_2.walls_right.append([2, 4, 6])
maze_2.walls_right.append([4])

maze_2.walls_down.append([])
maze_2.walls_down.append([1, 3])
maze_2.walls_down.append([3])
maze_2.walls_down.append([])
maze_2.walls_down.append([1])
maze_2.walls_down.append([1, 3])
maze_2.walls_down.append([])

maze_2.walls_portal = [3, 3]

maze_3 = maze()

maze_3.walls_right.append([2, 4])
maze_3.walls_right.append([1, 3])
maze_3.walls_right.append([4, 6])
maze_3.walls_right.append([3, 5])

maze_3.walls_down.append([])
maze_3.walls_down.append([2, 3])
maze_3.walls_down.append([2])
maze_3.walls_down.append([])
maze_3.walls_down.append([2])
maze_3.walls_down.append([1, 2])
maze_3.walls_down.append([])

maze_3.walls_portal = [1, 2]

mazes = (maze_1, maze_2, maze_3)

def check_ghost_turn(ghost):
    if ((ghost.x - player_offset[0]) % 10 == 0) and ((ghost.y - player_offset[1]) % 10 == 0) and ghost.y < 39:
        updated = False
        while updated == False:
            r = random.randint(0, 4)
            direction = 'U'
            if r == 1:
                direction = 'R'
            elif r == 2:
                direction = 'D'
            elif r == 3:
                direction = 'L'
            update_player_tile(ghost, direction, ghost.x, ghost.y)
            if check_valid_tile(ghost, direction) and not check_opposite_direction(ghost.direction, direction):
                ghost.direction = direction
                updated = True

def check_opposite_direction(d1, d2):
    if d1 == 'U' and d2 == 'D':
        return True
    elif d1 == 'D' and d2 == 'U':
        return True
    elif d1 == 'R' and d2 == 'L':
        return True
    elif d1 == 'L' and d2 == 'R':
        return True
    else:
        return False

def check_y_turn(direction):
    v = pac.x % 10
    if (v < 7):
        check_x =(math.floor(pac.x/10) * 10) + player_offset[0]
        update_player_tile(pac, direction, check_x, pac.y)
        if (check_valid_tile(pac, direction) == True):
            pac.x = check_x
            return True
    return False

def check_x_turn(direction):
    v = pac.y % 10
    if (v > 5):
        check_y =(math.ceil(pac.y/10) * 10) + player_offset[1]
        update_player_tile(pac, direction, pac.x, check_y)
        if (check_valid_tile(pac, direction) == True):
            pac.y = check_y
            return True
    if ( v < 5):
        check_y =(math.floor(pac.y/10) * 10) + player_offset[1]
        update_player_tile(pac, direction, pac.x, check_y)
        if (check_valid_tile(pac, direction) == True):
            pac.y = check_y
            return True
    return False
    
def check_valid_tile(player, direction):
    offset = 1
    if (direction == 'R'):
        if (player.tileX + offset == 7 and player.tileY == mazes[maze_index].walls_portal[1]):
            return True
        if (player.tileX + offset in mazes[maze_index].walls_right[player.tileY] or (player.tileX == 6 and player.tileY != mazes[maze_index].walls_portal[1])):
            return False
    elif (direction == 'L'):
        if (player.tileX + offset == -1 and player.tileY == mazes[maze_index].walls_portal[0]):
            return True
        if (player.tileX + offset in mazes[maze_index].walls_right[player.tileY] or (player.tileX == -1 and player.tileY != mazes[maze_index].walls_portal[0])):
            return False
    elif (direction == 'U'):
        if (player.tileY + offset in mazes[maze_index].walls_down[player.tileX] or player.tileY == -1):
            return False
    elif (direction == 'D'):
        if (player.tileY + offset in mazes[maze_index].walls_down[player.tileX] or player.tileY == 3):
            return False
    return True
        
def update_player_tile(player, direction, x, y):
    player.tileX = math.floor(x/10)
    player.tileY = math.floor(y/10)
    if (direction == 'R'):
        player.tileX = math.floor((x-3)/10)
    elif (direction == 'L'):
        player.tileX = math.floor((x-4)/10)
    elif (direction == 'U'):
        player.tileY = math.floor((y-2)/10)
    elif (direction == 'D'):
        player.tileY = math.floor((y-1)/10)
        
def move(player):
    if (player.moving == True):
        if (player.direction == 'R'):
            player.x += 1
        elif (player.direction == 'L'):
            player.x -= 1
        elif (player.direction == 'U'):
            player.y -= 1
        elif (player.direction == 'D'):
            player.y += 1
        
def portal_transport(player):
    if player.x < -2:
        player.x = 68
        player.y = 10 * mazes[maze_index].walls_portal[1] + player_offset[1]
        player.direction = 'L'
    if player.x > 68:
        player.x = -2
        player.y = 10 * mazes[maze_index].walls_portal[0] + player_offset[1]
        player.direction = 'R'

def display_ghost(ghost):
    if power_time == 0 or (power_time > 40 and ghost_state % 2 == 0) or (power_time < 41 and ghost_state < 9):
        if (ghost.direction == 'R'):
            thumby.display.blit(ghost_R, ghost.x, ghost.y, 7, 7)
        elif (ghost.direction == 'L'):
            thumby.display.blit(ghost_L, ghost.x, ghost.y, 7, 7)
        elif (ghost.direction == 'U'):
            thumby.display.blit(ghost_U, ghost.x, ghost.y, 7, 7)
        elif (ghost.direction == 'D'):
            thumby.display.blit(ghost_D, ghost.x, ghost.y, 7, 7)

def display_pac():
    if (pac.state == 0 and pac.moving == True):
        thumby.display.blit(pac_image, pac.x, pac.y, 7, 7)
    else:
        if (pac.direction == 'R'):
            thumby.display.blit(pac_image_R, pac.x, pac.y, 7, 7)
        elif (pac.direction == 'L'):
            thumby.display.blit(pac_image_L, pac.x, pac.y, 7, 7)
        elif (pac.direction == 'U'):
            thumby.display.blit(pac_image_U, pac.x, pac.y, 7, 7)
        elif (pac.direction == 'D'):
            thumby.display.blit(pac_image_D, pac.x, pac.y, 7, 7)

def check_collision(ghost):
    if abs(pac.x - ghost.x) < 5 and abs(pac.y - ghost.y) < 5:
        return True
    return False

def display_lives():
    x = 8
    for i in range(0, player_lives):
        if i < 2:
            thumby.display.blit(pac_large_2, x, 20, 15, 14)
        else:
            if player_lives == 3:
                thumby.display.blit(pac_large_2, x, 20, 15, 14)
            else:
                thumby.display.drawText(f"+{player_lives - 2}", x-3, 25, 1)
                break
        x = x + 20
        
def show_level():
    opening_scene()
    thumby.display.fill(0)
    display_score()
    thumby.display.drawText("Level:", 10, 15, 1)
    thumby.display.drawText(f"{level}", 30, 30, 1)
    thumby.display.update()
    wait(2000)
    show_score()
    
def show_score():
    global last_update
    last_update = time.ticks_ms()
    thumby.display.fill(0)
    if player_score == 0:
        thumby.display.drawText("Start", 15, 2, 1)
    else:
        display_score()
    display_lives()
    thumby.display.update()
    wait(2000)

def press_to_start():
    thumby.display.drawText("Press", 16, 15, 1)
    thumby.display.drawText("A or B", 12, 30, 1)
    thumby.display.update()
    character = ' '
    while character != '1' and character != '2':
        character = getcharinputNew()
    
def display_score():
    thumby.display.drawText(f"{player_score}", 5, 2, 1)
    
def game_over():
    last_update = time.ticks_ms()
    thumby.display.fill(0)
    display_score()
    thumby.display.drawText("GAME", 5, 15, 1)
    thumby.display.drawText("OVER", 35, 25, 1)
    thumby.display.update()
    wait(3000)
    thumby.display.fill(0)
    display_score()
    press_to_start()

def get_input():
    key = getcharinputNew()
    if pac.x > 0 and pac.x < 66:
        if key == 'L':
            if (check_x_turn('L') == True):
                pac.moving = True
                pac.direction = 'L'
        if key == 'R':
            if (check_x_turn('R') == True):
                    pac.moving = True
                    pac.direction = 'R'
        if key == 'U':
            if (check_y_turn('U') == True):
                    pac.moving = True
                    pac.direction = 'U'
        if key == 'D':
            if (check_y_turn('D') == True):
                    pac.moving = True
                    pac.direction = 'D'
    
def eat_balls():
    global ball_array
    global player_score
    global balls_eaten
    x = 0
    y = -1
    array_x = -1
    array_y = -1
    for b in ball_array:
        array_y += 1
        y += 5
        for bb in b:
            array_x += 1
            x += 5
            if bb == 1:
                if abs(pac.x + 3 - x) < 3 and abs(pac.y + 2 - y) < 3:
                    ball_array[array_y][array_x] = 0
                    player_score += 10
                    balls_eaten += 1
                    thumby.audio.play(440, 150)
                else:
                    thumby.display.fillRect(x, y, 2, 2, 0)
        x = 0
        array_x = -1
        
def eat_power_balls():
    global power_time
    global power_ball_1
    global power_ball_2
    p_time = 150
    if power_ball_1 == True:
        if abs(pac.x + 2 - 4) < 4 and abs(pac.y + 2 - 32) < 4:
            power_ball_1 = False
            power_time = p_time
    if power_ball_2 == True:
        if abs(pac.x + 2 - 63) < 4 and abs(pac.y + 2 - 2) < 4:
            power_ball_2 = False
            power_time = p_time

def display_ghost_bonus(bonus):
    thumby.display.fillRect(22, 13, 28, 13, 0)
    thumby.display.drawText(f"{bonus}", 24, 16, 1)
    thumby.display.update()
    wait(1000)
    
def update_display():
    thumby.display.blit(maze_images[maze_index], 0, 0, 72, 40)

    display_pac()
            
    for ghost in ghosts:
        display_ghost(ghost)
    
    eat_balls()
    eat_power_balls()
    
    if power_ball_1 == True:
        thumby.display.blit(power_ball, 4, 32, 5, 5)
    if power_ball_2 == True:
        thumby.display.blit(power_ball, 63, 2, 5, 5)
        
    if ghost_entering == True and power_time == 0:
        if pac.state == 0:
            thumby.display.fillRect(60, 38, 10, 2, 1)
            
    thumby.display.update()

def opening_scene():
    last_update = time.ticks_ms()
    global opening_x
    global opening_state
    global last_opening_action
    opening_state = 1
    opening_x = -50
    while True:
        if time.ticks_ms() - last_opening_action > 50:
            opening_x = opening_x + 3
            thumby.display.fill(0)
            if level == 1:
                thumby.display.drawText("Pico Pac", 3, 2, 1)
            else:
                display_score()
            if opening_state == 0:
                opening_state = 1
                thumby.display.blit(pac_large_1, opening_x, 20, 15, 14)
            else:
                opening_state = 0
                thumby.display.blit(pac_large_2, opening_x, 20, 15, 14)
            thumby.display.update()
            last_opening_action = time.ticks_ms()
        if time.ticks_ms() - last_update > 3000:
            break
        
if skip_opening == False:
    opening_scene()
    press_to_start()
    show_score()

# main game loop
while True:
    # move ghosts
    ghost_entering = False
    current_ghost_speed = ghost_speed
    if power_time > 0:
        current_ghost_speed = 140
    if time.ticks_ms() - last_ghost_update > current_ghost_speed:
        for ghost in ghosts:
            # Keep eaten ghosts out until power time is over
            if power_time > 0 and ghost.y > 45:
                # use random number to keep ghosts from clumping together
                ghost.y = 45 + random.randint(5, 25)
            move(ghost)
            check_ghost_turn(ghost)
            portal_transport(ghost)

        last_ghost_update = time.ticks_ms()
    
    # move pac
    if time.ticks_ms() - last_update > 50:
        ghost_state += 1
        if ghost_state > 10:
            ghost_state = 0
        if pac.state == 1:
            pac.state = 0
        else:
            pac.state = 1
            
        if power_time > 0:
            power_time -= 1
        else:
            ghost_multiplier = 0
        
        get_input()
        move(pac)
        
        if (balls_eaten > 57 and maze_index == 0) or  (balls_eaten > 55 and maze_index > 0):
            wait(1000)
            level += 1
            maze_index += 1
            if maze_index > 2:
                maze_index = 0

            if ghost_speed > 30:
                ghost_speed -= 5
            show_level()
            reset_players()
            reset_balls()

        portal_transport(pac)
        
        update_player_tile(pac, pac.direction, pac.x, pac.y)
        if (check_valid_tile(pac, pac.direction) == False):
            pac.moving = False
        
        for ghost in ghosts:
            if ghost.y > 35:
                ghost_entering = True
            if check_collision(ghost) == True:
                if power_time > 0:
                    ghost_multiplier += 1
                    display_ghost_bonus(100 * (2 ** ghost_multiplier))
                    player_score += 100 * (2 ** ghost_multiplier)
                    ghost.x = 60 + player_offset[0]
                    ghost.y = 50
                    ghost.direction = 'U'
                else:
                    wait(1000)
                    reset_players()
                    player_lives = player_lives - 1
                    if player_lives == 0:
                        game_over()
                        init_state()
                        show_score()
                    else:
                        show_score()
        
        if player_score > extra_life_score:
            display_ghost_bonus('1UP')
            player_lives += 1
            extra_life_score += 10000
            
        last_update = time.ticks_ms()
        update_display()`;


        this.ACE_EDITOR = ace.edit(this.EDITOR_DIV);
        this.ACE_EDITOR.session.setMode("ace/mode/python");
        this.ACE_EDITOR.setTheme("ace/theme/terminal");
        this.resize();

        this.INSERT_RESTORE = false;



        // Restore editor value, panel title, and font size
        var lastEditorValue = localStorage.getItem("EditorValue" + this.ID);
        var lastEditorTitle = localStorage.getItem("EditorTitle" + this.ID);
        var lastEditorPath = localStorage.getItem("EditorPath" + this.ID);
        var lastEditorFontSize = localStorage.getItem("EditorFontSize" + this.ID);
        var lastEditorSavedToThumby = localStorage.getItem("EditorSavedToThumby" + this.ID);


        this.ACE_EDITOR.setValue(defaultCode, 1);
        

        if (lastEditorTitle != null) {
            this.setTitle(lastEditorTitle);
        } else if (state['path'] != undefined) {
            this.setTitle('Editor' + this.ID + ' - ' + state['path']);
            this.SAVED_TO_THUMBY = true;         // Just opened from thumby, so saved to it
        } else {
            this.setTitle('Editor' + this.ID);
            this.SAVED_TO_THUMBY = undefined;    // For sure not saved to Thumby but also new, keep undefined so can be closed without alert
        }

        if (lastEditorPath != null) {
            this.EDITOR_PATH = lastEditorPath;
        } else if (state['path'] != undefined) {
            this.EDITOR_PATH = state['path'];
            localStorage.setItem("EditorPath" + this.ID, this.EDITOR_PATH);
        } else {
            this.EDITOR_PATH = undefined;
        }

        this.FONT_SIZE = 10;
        if (lastEditorFontSize != null) {
            this.FONT_SIZE = lastEditorFontSize;
        }

        // Get live autocomplete state, true if 'true' or undefined, affects all editors
        var langTools = ace.require("ace/ext/language_tools");
        this.AUTOCOMPLETE_STATE = (localStorage.getItem("EditorAutocompleteState") === 'true' || localStorage.getItem("EditorAutocompleteState") == undefined);
        this.setAutocompleteButtonText();

        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: this.AUTOCOMPLETE_STATE
        });

        if (lastEditorSavedToThumby != null) {
            this.SAVED_TO_THUMBY = (lastEditorSavedToThumby === 'true');
        }


        this.state = {};
        this.state.id = this.ID;
        this._container.setState(this.state);


        // File picker options for saving and opening python & text files
        // https://wicg.github.io/file-system-access/#api-filepickeroptions
        this.FILE_OPTIONS = {
            types: [
                {
                    description: 'Text Files',
                    accept: {
                        'text/python': ['.py'],
                        'text/plain': ['.txt', '.text', '.cfg']
                    }
                }
            ],
            suggestedName: ".py",
        };

        // When the editor has focus capture ctrl-s and do save file function
        this.ACE_EDITOR.commands.addCommand({
            name: 'SaveCurrentTab',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: () => {
                this.onSaveToThumby();
            },
            readOnly: true
        });

        // Set to light theme if window is set to light because theme was toggled
        if (window.theme == "light") {
            this.setThemeLight();
        }
    }

    setAutocompleteButtonText() {
        if (this.AUTOCOMPLETE_STATE) {
            this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete OFF";
        } else {
            this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete ON";
        }
    }


    setAutocompleteState(state) {
        this.ACE_EDITOR.setOptions({
            enableLiveAutocompletion: state
        });
        this.AUTOCOMPLETE_STATE = state;
        this.setAutocompleteButtonText();
    }


    toggleAutocompleteStateForAll() {
        if (this.AUTOCOMPLETE_STATE) {
            this.AUTOCOMPLETE_STATE = false;
        } else {
            this.AUTOCOMPLETE_STATE = true;
        }

        localStorage.setItem("EditorAutocompleteState", this.AUTOCOMPLETE_STATE);

        // Apply to all editors, even this one
        for (const [id, editor] of Object.entries(this.EDITORS)) {
            editor.setAutocompleteState(this.AUTOCOMPLETE_STATE);
        }
    }


    setPath(path) {
        this.EDITOR_PATH = path;
        localStorage.setItem("EditorPath" + this.ID, this.EDITOR_PATH);
    }

    setSaved() {
        this.SAVED_TO_THUMBY = true;
        localStorage.setItem("EditorSavedToThumby" + this.ID, this.SAVED_TO_THUMBY);
    }


    updateTitleSaved() {
        if (this.SAVED_TO_THUMBY == true) {
            if (this.EDITOR_PATH != undefined) {
                this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);
            } else {
                this.setTitle("Editor" + this.ID);
            }
            localStorage.setItem("EditorSavedToThumby" + this.ID, this.SAVED_TO_THUMBY);
        }
    }


    setThemeLight() {
        this.ACE_EDITOR.setTheme("ace/theme/chrome");
        localStorage.setItem(this.ELEM_ID + "Theme", "light");
    }

    setThemeDark() {
        this.ACE_EDITOR.setTheme("ace/theme/monokai");
        localStorage.setItem(this.ELEM_ID + "Theme", "dark");
    }


    setTitle(title) {
        this._container.setTitle(title);
        this.EDITOR_TITLE = title;
        localStorage.setItem("EditorTitle" + this.ID, title);
    }


    // Needs to be called when editor closed otherwise edits that are spawned again will take on the stored data
    clearStorage() {
        localStorage.removeItem("EditorValue" + this.ID);
        localStorage.removeItem("EditorTitle" + this.ID);
        localStorage.removeItem("EditorPath" + this.ID);
        localStorage.removeItem("EditorFontSize" + this.ID);
        localStorage.removeItem("EditorSavedToThumby" + this.ID);
    }


    getElemID() {
        return this.ELEM_ID;
    }


    resize() {
        this.ACE_EDITOR.resize();
    }


    increaseFontSize() {
        this.FONT_SIZE++;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });
        localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
    }
    decreaseFontSize() {
        if (this.FONT_SIZE - 1 > 0) {
            this.FONT_SIZE--;
            this.ACE_EDITOR.setOptions({
                fontSize: this.FONT_SIZE.toString() + "pt",
            });
            localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
        }
    }
    resetFontSize() {
        this.FONT_SIZE = 10;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });
        localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
    }


    async openFileContents(contents) {
        if (this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to overwrite this editor?')) {
            return;
        }
        this.ACE_EDITOR.setValue(contents, 1);
    }


    // Opens a new tab with contents of local file from PC
    async openFile() {
        if (this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to overwrite this editor?')) {
            return;
        }

        let fileHandle;
        try {
            [fileHandle] = await window.showOpenFilePicker(this.FILE_OPTIONS);
        } catch (err) {
            return;
        }

        const file = await fileHandle.getFile();
        var code = await file.text();

        this.ACE_EDITOR.setValue(code, 1);

        this.CURRENT_FILE_NAME = file.name;
        console.log(this.ELEM_ID + "Name");
        localStorage.setItem(this.ELEM_ID + "Name", this.CURRENT_FILE_NAME);

        return file.name;
    }


    // Shows the file dialog and suggests current name
    async exportFileAs() {
        var fileHandle = undefined;
        try {
            if (this.CURRENT_FILE_NAME == "") {
                this.FILE_OPTIONS.suggestedName = "NewFile.py";
            } else {
                this.FILE_OPTIONS.suggestedName = this.CURRENT_FILE_NAME;
            }
            fileHandle = await window.showSaveFilePicker(this.FILE_OPTIONS);            // Let the user pick location to save with dialog
        } catch (err) {                                                                    // If the user aborts, stop function execution, leave unsaved
            this.FILE_OPTIONS.suggestedName = ".py";                                    // Reset this before stopping function
            console.log(err);
            return;                                                                     // Stop function
        }

        try {
            var writeStream = await fileHandle.createWritable();                        // For writing to the file
        } catch (err) {
            console.log(err);
            return;                                                                     // If the user doesn't allow tab to save to opened file, don't edit file
        }

        var file = fileHandle.getFile();                                                // Get file from promise so that the name can be retrieved
        var data = await this.ACE_EDITOR.getValue();                                    // Get tab contents
        await writeStream.write(data);                                                  // Write dataif using an HTTPS connection
        writeStream.close();                                                            // Save the data to the file now
    }



    // Expose common Ace editor operation
    getValue() {
        return this.ACE_EDITOR.getValue();
    }

    // Expose common Ace editor operation
    setValue(value, index) {
        return this.ACE_EDITOR.setValue(value, index);
    }

    // Wrapper for the ACE editor insert function, used for exporting custom bitmaps to editor
    insert(str) {
        this.ACE_EDITOR.insert(str);
    }

    // Wrapper for ACE editor getSelectedText function, used for getting custom bitmaps from editor
    getSelectedText() {
        return this.ACE_EDITOR.getSelectedText();
    }
}