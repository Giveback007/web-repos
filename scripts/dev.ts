// https://github.com/brainsatplay/dev-build#example-build-file
import { devBrowser } from 'build-dev';
import { projects } from './projects';

(function run([type]) {
    const idx = projects.findIndex(x => x.fromDir.includes(type));
    if (idx === -1) throw new Error(`[type: ${type}] not found in [projects.ts]`);
    const opts = {...projects[idx]};
    opts.toDir.replace('dist/', '.cache');

    return devBrowser(opts);

    switch (type) {
        case 'exercise-counter':

            return devBrowser({
                fromDir: 'exercise-counter',
                entryFile: 'main.js',
                toDir: '.cache/exercise-counter',
                copyFiles: ['index.html', 'public']
            });
        case 'ze-list':
            return devBrowser({
                fromDir: 'ze-list/src',
                entryFile: 'index.tsx',
                toDir: '.cache/ze-list',
                copyFiles: ['index.html', 'public']
            });
        case 'heart-rate':
            return devBrowser({
                fromDir: 'heart-rate/src',
                entryFile: 'main.tsx',
                toDir: '.cache/heart-rate',
                copyFiles: ['index.html', 'public']
            });
        case 'calculator':
            return devBrowser({
                fromDir: 'calculator',
                entryFile: 'main.js',
                toDir: '.cache/calculator',
                copyFiles: ['index.html', 'public']
            });
        default:
            throw new Error(`"${type}" not implemented`);
    }
})(process.argv.slice(2));
