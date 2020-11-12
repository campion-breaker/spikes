addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url)

  const response = new Response('Campion!', {
    headers: { 'content-type': 'text/plain' },
  });

  response.headers.set("Access-Control-Allow-Origin", url.origin)
  return response;
}
