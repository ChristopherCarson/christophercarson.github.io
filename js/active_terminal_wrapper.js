// ##### ACTIVE_TERMINAL_WRAPPER.js #####
// Wraps the Xterm.js class into a class that handles making
// the terminal look active. Only implements functions of
// Xterm.js that are relevent to the Thumby Manager project


class ActiveTerminal{

    // Define common objects used within this class right on object init
    // and open a terminal with addon to fit to parent HTML container
    constructor(_container, state){
        // Related to golden-layout
        this._container = _container;

        // Contains all bitmap builder elements
        this.SHELL_DIV = document.createElement("div");
        this.SHELL_DIV.classList.add("shell");
        this._container.element.appendChild(this.SHELL_DIV);

        this.TERM = new Terminal();                 // The Xterm.js object
        this.TERM.open(this.SHELL_DIV);             // Hook Xterm.js onto HTML object 'terminal'
        this.FITADDON = new FitAddon.FitAddon();    // The Xterm fit addon object
        this.TERM.loadAddon(this.FITADDON);         // Load fit addon in Xterm.js
        
        // Wait until all components have divs before fitting
        setTimeout(() => {
            this.autoFit();
        }, 350)

        // Listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.autoFit.bind(this));

        // Listen for layout resize event and re-fit terminal
        this._container._layoutManager.on('stateChanged', () => {
            if(this.AUTO_RESIZING){
                this.autoFit();
            }
        });


        this._container._layoutManager.on('itemDestroyed', (event) => {
            if(this._container.title == event._target._title){
                this.TERM.dispose();
            }
        });


        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
        });


        // Write information to terminal on page load for user
        // and setup callbacks for typing into terminal
        this.initTerminalView();

        // ### CALLBACKS ###
        // Functions defined outside this module but used inside
        this.onType = undefined;

        this.writeln("TinyCircuits Thumby Web IDE");
        this.writeln("Waiting for connection... (click 'Connect Thumby')");

        this.AUTO_RESIZING = true;
    }


    stopAutoResizing(){
        this.AUTO_RESIZING = false;
    }

    startAutoResizing(){
        this.AUTO_RESIZING = true;
    }


    callbackSetWriteCMD(callback){
        this.CALLBACK_WRITE_CMD = callback;
    }


    setLightTheme(){
        this.TERM.setOption('theme', {
            background: '#fdf6e3',
            cursor: "gray",
            foreground: "black"
        });
    }

    setDarkTheme(){
        this.TERM.setOption('theme', {
            background: 'black',
            cursor: "white",
            foreground: "white"
        });
    }


    // Resizes the terminal to fit its parent container
    autoFit(){
        this.FITADDON.fit();
    }


    initTerminalView(){
        if (this.TERM._initialized) {
            return;
        }
    
        this.TERM._initialized = true;
    
        // Setup special character callback
        this.TERM.onData(e => {            
            switch (e) {
                case '':   // Ctrl-V (paste)
                    throw "Paste (uncaught on purpose)";
                break;
                default:    // Send all other characters to RP2040
                    this.onType(e);
            }
        });
    }


    // Allow using write function of Xterm.js through this class
    write(data){
        this.TERM.write(data);
    }

    // Allow using writeln function of Xterm.js through this class
    writeln(data){
        this.TERM.writeln(data);
    }
}