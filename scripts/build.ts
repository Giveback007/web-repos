// https://github.com/brainsatplay/dev-build#example-build-file
import { buildBrowser, copy } from 'build-dev';
import historyApiFallback from 'connect-history-api-fallback';
import browserSync from "browser-sync";
import { projects } from './projects';

const onProcessEnd = (fct: (exitCode: number) => unknown) =>
    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(ev => process.on(ev, fct));

// should have logic here to build the full project
setTimeout(async () => {
    const [type = 'build'] = process.argv.slice(2)
    if (type === 'build') {
        copy('./index.html', './dist/index.html');
        copy('./manifest.webmanifest', './dist/manifest.webmanifest');
        copy('public', './dist/public');

        const promises = projects.map(opt => buildBrowser({
            ...opt,
            fromDir: 'projects/' + opt.fromDir,
            env: { define: { GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID} }
        }));
        await Promise.all(promises);

    } else if (type === 'test') {
        const bs = browserSync.create();
        bs.init({
            server: 'dist/',
            middleware: [ historyApiFallback() ],
            reloadDelay: 0,
            reloadDebounce: 100,
            reloadOnRestart: true,
            ghostMode: false,
            port: 5000,
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
}, 0);


// ~--~ PROJECT BUILD OPTIONS ~--~ //
