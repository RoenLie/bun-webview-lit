import { Webview } from "webview-bun";
import workerFile from './server-worker.ts' with { type: 'file' };
import staticRoutes from '../dist/client/static-routes.json' with { type: 'text' };


const worker = new Worker(URL.createObjectURL(Bun.file(workerFile)));
const encoder = new TextEncoder();
const buffer = encoder.encode(staticRoutes as unknown as string).buffer

worker.postMessage(buffer);
worker.onmessage = (ev) => {
	if (ev.data === 'terminate')
		worker.terminate();
}


const webview = new Webview(true);
webview.navigate('http://localhost:6161')


let counter = 0;
// Create and bind `press` to the webview javascript instance.
// This functions in addition to logging its parameters also returns
// a value from bun to webview.
webview.bind("press", (a, b, c) => {
console.log(a, b, c);

return { times: counter++ };
});

// Bind the `log` function in the webview to the parent instances `console.log`
webview.bind("log", (...args) => console.log(...args));

webview.run();
