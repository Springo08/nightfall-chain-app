const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Start the backend server
function startBackend() {
    console.log('Starting backend server...');

    const backendPath = path.join(__dirname, '../backend');

    // Start the backend using ts-node
    backendProcess = spawn('npx', ['ts-node', 'api.ts'], {
        cwd: backendPath,
        env: {
            ...process.env,
            HTTP_PORT: '3002',
            P2P_PORT: '6002'
        },
        shell: true
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        title: 'Blockchain Ecosystem',
        backgroundColor: '#1a1a1a'
    });

    // In development, load from Vite dev server
    // In production, load from built files
    const isDev = !app.isPackaged;

    if (isDev) {
        // Start Vite dev server
        const frontendPath = path.join(__dirname, '../frontend');
        const viteProcess = spawn('npm', ['run', 'dev'], {
            cwd: frontendPath,
            shell: true
        });

        viteProcess.stdout.on('data', (data) => {
            console.log(`Frontend: ${data}`);
        });

        viteProcess.stderr.on('data', (data) => {
            console.error(`Frontend: ${data}`);
        });

        // Wait a bit for Vite to start, then load
        setTimeout(() => {
            mainWindow.loadURL('http://localhost:5173/app');
        }, 5000);

        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        // Load built frontend
        mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    startBackend();

    // Wait a bit for backend to start
    setTimeout(() => {
        createWindow();
    }, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Kill backend process
    if (backendProcess) {
        backendProcess.kill();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    // Kill backend process
    if (backendProcess) {
        backendProcess.kill();
    }
});
