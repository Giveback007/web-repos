// https://github.com/brainsatplay/dev-build#example-build-file
import { buildBrowser, copy } from 'build-dev';
import historyApiFallback from 'connect-history-api-fallback';
import browserSync from "browser-sync";

type Opts = Parameters<typeof buildBrowser>[0];

const onProcessEnd = (fct: (exitCode: number) => unknown) =>
    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(ev => process.on(ev, fct));

// should have logic here to build the full project
(async function run([type]) {
    copy('./index.html', './dist/index.html');

    const arr: Opts[] = [
        /* -- Exercise-Counter -- */
        {
            fromDir: 'exercise-counter',
            entryFile: 'main.js',
            toDir: 'dist/exercise-counter',
            copyFiles: ['index.html', 'style.css'],
        },
        /* -- Ze-List -- */
        {
            fromDir: 'ze-list/src',
            entryFile: 'index.tsx',
            toDir: 'dist/ze-list',
            copyFiles: ['index.html', 'public']
        }
    ];

    const promises = arr.map(opt => buildBrowser(opt));
    await Promise.all(promises);

    if (type === 'test') {
        const bs = browserSync.create();
        bs.init({
            server: 'dist/',
            middleware: [ historyApiFallback() ],
            reloadDelay: 0,
            reloadDebounce: 100,
            reloadOnRestart: true,
            ghostMode: false,
        });

        onProcessEnd(() => {
            bs?.pause();
            bs?.cleanup();
            bs?.exit();
            process.exit();
        });

        // can kill all node:
        // taskkill /f /im node.exe
    }
})(process.argv.slice(2));

