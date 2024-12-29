const { createServer } = require('vite');
const path = require('path');
const { spawn } = require('child_process');

console.log('[DEV] Development script starting');
console.log('[DEV] Script Process ID:', process.pid);

// Guard against multiple starts
let electronStarted = false;

// Set environment variables
process.env.NODE_ENV = 'development';
const rendererPort = 3000;

async function main() {
  console.log('[DEV] Entering dev script main function');
  try {
    // Start Vite dev server for renderer process
    console.log('[DEV] Creating Vite server');
    const server = await createServer({
      configFile: path.resolve(__dirname, '../vite.config.ts'),
      mode: 'development',
    });

    await server.listen(rendererPort);
    console.log('[Dev] Vite server running at http://localhost:' + rendererPort);

    // Watch and rebuild main process
    const tscMain = spawn('tsc', ['-p', 'tsconfig.main.json', '--watch'], {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Watch and rebuild preload script
    const tscPreload = spawn('tsc', ['-p', 'tsconfig.preload.json', '--watch'], {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Wait for initial compilation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start Electron app
    if (electronStarted) {
      console.log('[DEV] Electron already started, skipping...');
      return;
    }
    
    const electronPath = require('electron');
    const appPath = path.resolve(__dirname, '..');
    console.log('[DEV] Starting Electron process');
    console.log('[DEV] Electron path:', electronPath);
    console.log('[DEV] App path:', appPath);
    
    electronStarted = true;
    const electronProcess = spawn(electronPath, [appPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: `http://localhost:${rendererPort}`,
        ELECTRON_IS_DEV: '1',
        ELECTRON_STARTUP_MODE: 'dev-script'
      }
    });

    console.log('[DEV] Electron process spawned');

    electronProcess.on('close', () => {
      tscMain.kill();
      tscPreload.kill();
      server.close();
      process.exit();
    });

    // Clean up processes on exit
    process.on('SIGINT', () => {
      server.close();
      tscMain.kill();
      tscPreload.kill();
      electronProcess.kill();
      process.exit();
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
