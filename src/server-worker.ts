export default undefined as any;


let staticRoutes = {} as Record<string, { content: string; type: string; }>;


globalThis.onmessage = (ev) => {
	const decoder = new TextDecoder("utf-8");
	const text = decoder.decode(ev.data);

	staticRoutes = JSON.parse(text);

	// webview is blocking the main thread, so this message will only
	// arrive when the webview instance is closed.
	globalThis.postMessage('terminate');
};


export const server = Bun.serve({ port: 6161, fetch: async (req) => {
	const url = new URL(req.url);
	const path = url.pathname.slice(1); // Remove leading slash

	if (!(path in staticRoutes)) {
		console.log('not found:', path);

	  	return new Response("Not found", { status: 404 });
	}

	//console.log('found:', path);

	const route = staticRoutes[path] as {
		content: string;
		type: string;
	};

	return new Response(route.content, {
		headers: {
			'Content-Type': route.type
		}
	});
} });