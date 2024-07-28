import { unlink, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, resolve, relative, basename } from 'node:path';

import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import { globby } from 'globby';
import { extname } from 'path';


export default defineConfig({
	build: {
		emptyOutDir: true,
		outDir: '../dist/client',
	},
	plugins: [
		assetManifestPlugin()
	]
});


function assetManifestPlugin(): Plugin {
	let cfg: ResolvedConfig;

	const contentType: Record<string, string> = {
		'.js':   'text/javascript',
		'.html': 'text/html',
		'.svg':  'image/svg+xml'
	};

	return {
		name: 'static-routes',
		configResolved: config => void (cfg = config),
		closeBundle: async () => {
			const filePath = resolve(join(cfg.build.outDir, 'static-routes.json'));
			const glob     = cfg.build.outDir.replaceAll('\\', '/') + '/**/*';
			const files    = (await globby(glob))
				.map(file => resolve(file))

			const importsAndExports = files.reduce((acc, file) => {
				const importName = basename(file)
					.split('.')[0]!
					.replace('-', '_');

				acc.imports.push({
					name: importName,
					path: file,
				});

				let exportName = relative(filePath, resolve(file))
					.replaceAll('\\', '/')
					.split('/')
					.slice(1)
					.join('/');

				if (exportName === 'index.html')
					exportName = '';

				acc.exports.push({
					name: exportName,
					content: readFileSync(file, { encoding: 'utf-8' })
						.replaceAll('\r\n', '')
						.replaceAll('\r', '')
						.replaceAll('\n', '')
						.replaceAll('\t', '')
						.replaceAll('\\', '\\\\')
						.replaceAll('"', '\\"'),
					type: contentType[extname(file)]!,
				});

				return acc;
			}, { imports: [], exports: [] } as {
				imports: { name: string; path: string; }[];
				exports: { name: string; content: string; type: string; }[];
			});

			let fileText = '';

			fileText += `{\n`;

			importsAndExports.exports.forEach((exp, i) => {
				fileText += `\t"${exp.name}": {\n`
					+ `\t\t"content": "${exp.content}",\n`
					+ `\t\t"type": "${exp.type}"\n`
					+ `\t}${ i !== importsAndExports.exports.length - 1 ? ',': '' }\n`;
			});

			fileText += `}`;

			try {
				await writeFile(filePath, fileText);
			} catch {
				await unlink(filePath);
			}
		},
	} satisfies Plugin
}
