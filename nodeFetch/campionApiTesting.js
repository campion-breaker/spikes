const fetch = require("node-fetch");
const FormData = require('form-data');
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
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/campion`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": "application/javascript",
      },
      body: "addEventListener('fetch', hello => { hello.respondWith(fetch(hello.request)) })",
    }
  );

  const body = await data.json();
  console.log(body)
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
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/hello`,
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

async function test() {
  const accountId = await getAccountId();
  const form = new FormData();
  form.append('bindings', JSON.stringify([{"name": "HELLO",
  "namespace_id": "0f026bbb1c6d490ca6e64015b9fe93c1",
  "type": "kv_namespace"}]));

  form.append('script', "addEventListener('fetch', hello => { hello.respondWith(fetch(hello.request)) })");

  const data = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/testhello/bindings`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.EMAIL,
        "X-Auth-Key": process.env.APIKEY,
        "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
      },
      body: form,
    }
  );

  const body = await data.json();
  console.log(body)
}
