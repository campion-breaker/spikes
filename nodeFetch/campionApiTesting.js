const fetch = require("node-fetch");
require('dotenv').config();

async function getAccountId() {
  const data = await fetch("https://api.cloudflare.com/client/v4/accounts", {
    headers: {
      'X-Auth-Email': process.env.EMAIL,
      'X-Auth-Key': process.env.APIKEY,
      'Content-Type': 'application/json'
    }
  });

  const body = await data.json();
  return body.result[0].id;
};

async function getNamespaceIds(accountId) {
  const data = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`,
    {
      method: "GET",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": "application/json",
      },
    }
  );

  const body = await data.json();
  return body.result;
}

async function putWorker() {
  const accountId = await getAccountId();
  const data = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/testworkerfuckdeno2`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": "application/javascript",
      },
      body:
        "addEventListener('fetch', hello => { penis.respondWith(fetch(hello.request)) })",
    }
  );
}

async function createNamespace() {
  const accountId = await getAccountId();
  const data = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`,
    {
      method: "POST",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({title: "Testing123"}),
    }
  );
  const body = await data.json();
}

async function writeToNamespace() {
  const accountId = await getAccountId();
  const namespaces = await getNamespaceIds(accountId);
  const namespaceId = namespaces.filter((kv) => kv.title === 'Testing123')[0].id;

  const data = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/penis`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({title: "hi", what: "testing"}),
    }
  );
  const body = await data.json();
  console.log(body)
}

writeToNamespace();
