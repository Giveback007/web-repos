// https://github.com/brainsatplay/dev-build#example-build-file
import { devBrowser } from 'build-dev';

(function run([type]) {
    switch (type) {
        case 'exercise-counter':
            return devBrowser({
                fromDir: 'exercise-counter',
                entryFile: 'main.js',
                toDir: '.cache/exercise-counter',
                copyFiles: ['index.html', 'style.css']
            });
        default:
            throw new Error(`"${type}" not implemented`);
    }
})(process.argv.slice(2));
