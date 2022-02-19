import type { buildBrowser } from "build-dev";

type Opts = Parameters<typeof buildBrowser>[0];

export const projects: Opts[] = [
    /* -- Exercise-Counter -- */
    {
        fromDir: 'exercise-counter',
        entryFile: 'main.js',
        toDir: 'dist/exercise-counter',
        copyFiles: ['index.html', 'public']
    },
    /* -- Ze-List -- */
    {
        fromDir: 'ze-list/src',
        entryFile: 'main.tsx',
        toDir: 'dist/ze-list',
        copyFiles: ['index.html', 'public']
    },
    /* -- Heart-Rate -- */
    {
        fromDir: 'heart-rate/src',
        entryFile: 'main.tsx',
        toDir: 'dist/heart-rate',
        copyFiles: ['index.html', 'public']
    },
    /* -- Calculator -- */
    {
        fromDir: 'calculator',
        entryFile: 'main.js',
        toDir: 'dist/calculator',
        copyFiles: ['index.html', 'public']
    },
    /* -- Vanilla JS Game Of Life -- */
    {
        fromDir: 'vjs-game-of-life',
        entryFile: 'main.js',
        toDir: 'dist/vjs-game-of-life',
        copyFiles: ['index.html', 'public']
    },
    /* -- React JS Game Of Life -- */
    {
        fromDir: 'react-game-of-life',
        entryFile: 'main.jsx',
        toDir: 'dist/react-game-of-life',
        copyFiles: ['index.html', 'public']
    },
    /* -- Tic-Tac-Toe -- */
    {
        fromDir: 'tic-tac-toe',
        entryFile: 'main.js',
        toDir: 'dist/tic-tac-toe',
        copyFiles: ['index.html', 'public']
    },
    /* -- Tic-Tac-Toe -- */
    {
        fromDir: 'tic-tac-toe',
        entryFile: 'main.js',
        toDir: 'dist/tic-tac-toe',
        copyFiles: ['index.html', 'public']
    }
];