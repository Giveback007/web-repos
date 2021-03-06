// https://github.com/brainsatplay/dev-build#example-build-file
import { devBrowser } from 'build-dev';
import { projects } from './projects';

(function run(type: string) {
    const idx = projects.findIndex(x => x.fromDir.includes(type));
    if (idx === -1) throw new Error(`[type: ${type}] not found in [projects.ts]`);
    
    const opts = {
        ...projects[idx],
        env: { envFile: '.env', define: { isDev: true } },
    };
    opts.fromDir = 'projects/' + opts.fromDir
    opts.toDir = opts.toDir.replace('dist/', '.cache/');
    
    return devBrowser(opts);
})(process.argv.slice(2)[0]);
