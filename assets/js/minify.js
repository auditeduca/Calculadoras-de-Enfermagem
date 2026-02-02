/**
 * MINIFY.JS - Script de Minificação de Arquivos JS e CSS
 * Versão: 3.0 - Usa esbuild para JS e minificação nativa para CSS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = './user_input_files';
const outputDir = './minified';
const esbuildPath = '/tmp/.npm-global/lib/node_modules/@benborla29/mcp-server-mysql/node_modules/esbuild/bin/esbuild';

const jsFiles = [
    'accessibility.js',
    'footer.js',
    'global-main-index.js',
    'global-main.js',
    'header.js',
    'preload.js',
    'utils.js'
];

const cssFiles = [
    'accessibility.css',
    'footer.css',
    'global-main-index.css',
    'global-main.css',
    'global.css',
    'header.css',
    'preload.css'
];

/**
 * Minifica JavaScript usando esbuild
 */
function minifyJS(sourcePath, filename) {
    const outputPath = path.join(outputDir, filename);
    try {
        execSync(`${esbuildPath} "${sourcePath}" --minify --outfile="${outputPath}"`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`✗ Erro ao minificar ${filename}:`, error.message);
        return false;
    }
}

/**
 * Minifica CSS preservando strings
 */
function minifyCSS(content) {
    let result = content;

    // Preservar strings em CSS
    const preservedStrings = [];
    let stringIndex = 0;

    result = result.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
        preservedStrings.push(match);
        return `__STRING_${stringIndex++}__`;
    });

    // Remover comentários
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remover quebras de linha
    result = result.replace(/\n/g, '');

    // Espaços múltiplos
    result = result.replace(/\s+/g, ' ');

    // Espaços ao redor de caracteres especiais
    result = result.replace(/\s*([{}:;,>+~])\s*/g, '$1');

    // Remove último ponto e vírgula antes de }
    result = result.replace(/;}/g, '}');

    // Restaurar strings
    preservedStrings.forEach((str, i) => {
        result = result.replace(`__STRING_${i}__`, str);
    });

    return result.trim();
}

/**
 * Processa arquivo CSS
 */
function processCSS(filename) {
    const sourcePath = path.join(sourceDir, filename);
    const outputPath = path.join(outputDir, filename);

    try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        const minified = minifyCSS(content);
        fs.writeFileSync(outputPath, minified);

        const originalSize = content.length;
        const minifiedSize = minified.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

        console.log(`✓ ${filename}: ${originalSize} → ${minifiedSize} bytes (${savings}% redução)`);
        return { filename, originalSize, minifiedSize, savings };
    } catch (error) {
        console.error(`✗ Erro ao processar ${filename}:`, error.message);
        return null;
    }
}

/**
 * Main
 */
function main() {
    console.log('=== Minificação de Arquivos ===\n');

    // Criar diretório de saída
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('--- Minificando JavaScript (esbuild) ---\n');
    const jsResults = [];
    for (const filename of jsFiles) {
        const sourcePath = path.join(sourceDir, filename);
        if (minifyJS(sourcePath, filename)) {
            const original = fs.statSync(sourcePath).size;
            const minified = fs.statSync(path.join(outputDir, filename)).size;
            const savings = ((original - minified) / original * 100).toFixed(1);
            console.log(`✓ ${filename}: ${original} → ${minified} bytes (${savings}% redução)`);
            jsResults.push({ filename, originalSize: original, minifiedSize: minified, savings });
        }
    }

    console.log('\n--- Minificando CSS ---\n');
    const cssResults = cssFiles.map(f => processCSS(f)).filter(r => r !== null);

    // Resumo
    console.log('\n=== Resumo ===\n');

    const totalJS = jsResults.reduce((acc, r) => ({
        original: acc.original + r.originalSize,
        minified: acc.minified + r.minifiedSize
    }), { original: 0, minified: 0 });

    const totalCSS = cssResults.reduce((acc, r) => ({
        original: acc.original + r.originalSize,
        minified: acc.minified + r.minifiedSize
    }), { original: 0, minified: 0 });

    console.log(`JavaScript: ${totalJS.original} → ${totalJS.minified} bytes (${((totalJS.original - totalJS.minified) / totalJS.original * 100).toFixed(1)}% redução)`);
    console.log(`CSS: ${totalCSS.original} → ${totalCSS.minified} bytes (${((totalCSS.original - totalCSS.minified) / totalCSS.original * 100).toFixed(1)}% redução)`);
    console.log(`\nTotal: ${totalJS.original + totalCSS.original} → ${totalJS.minified + totalCSS.minified} bytes`);

    console.log(`\nArquivos minificados salvos em: ${outputDir}/`);
}

main();
