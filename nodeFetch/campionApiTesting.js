const fetch = require("node-fetch");

const email = "arthur@sent.com";
const apiKey = "7d24e00950504429425723184b634b4b6366e";

let accountId;

async function getAccountId() {
  const data = await fetch("https://api.cloudflare.com/client/v4/accounts", {
    headers: {
      "X-Auth-Email": email,
      "X-Auth-Key": apiKey,
      "Content-Type": "application/json",
    },
  }).then((response) => response.json().then((data) => data));

  accountId = JSON.parse(data).result[0].id;
}

async function putWorker() {
  await getAccountId();
  console.log(accountId);
  return await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/testworkerfuckdeno2`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": email,
        "X-Auth-Key": apiKey,
        "Content-Type": "application/javascript",
      },
      body:
        "addEventListener('fetch', penis => { penis.respondWith(fetch(penis.request)) })",
    }
  ).then((response) => response.body
}

putWorker();
