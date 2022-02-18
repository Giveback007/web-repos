// https://github.com/brainsatplay/dev-build#example-build-file
import { buildBrowser, copy } from 'build-dev';
import historyApiFallback from 'connect-history-api-fallback';
import browserSync from "browser-sync";

export const onProcessEnd = (fct: (exitCode: number) => unknown) =>
    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(ev => process.on(ev, fct));

// should have logic here to build the full project
(async function run([type]) {
    copy('./index.html', './dist/index.html');

    /* -- Exercise-Counter -- */
    await buildBrowser({
        fromDir: 'exercise-counter', // ./browser
        entryFile: 'main.js', // ./browser/index.tsx
        toDir: 'dist/exercise-counter', // ./.cache/web
        // copy ./browser/index.html & ./browser/public/
        copyFiles: ['index.html', 'style.css'],
        // env: { envFile: '.key' }
    });

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

