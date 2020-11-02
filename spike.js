// these constants will eventually be stored in KV for each specific service
const PERCENT_OF_REQUESTS = 25;
const SERVICE_FAILURE_THRESHOLD = 3;
const NETWORK_FAILURE_THRESHOLD = 5;
const ERROR_TIMEOUT = 60;
const MAX_LATENCY = 1000; // in milliseconds
const SUCCESS_THRESHOLD = 2; // do we want to differentiate between service or network success threshold?
const TIMESPAN = 60; // time for TTL
const SERVICE = "https://google.com";

async function handleRequest(request) {
  // parse url for serviceKey
  const serviceKey = "hardcode";
  const circuitStateObj = await circuitState(serviceKey, request);

  if (circuitStateObj.state === "OPEN") {
    return new Response(circuitStateObj.failureKind);
  } else if (circuitStateObj.state === "HALF-OPEN" && !canRequestProceed()) {
    return new Response(circuitStateObj.failureKind);
  }

  const response = await processRequest(request);

  if (response.failure) {
    updateKVFailures(response.kvKey, request.url);
  } else if (!response.failure && circuitStateObj.state === "HALF-OPEN") {
    updateKVFailures(response.kvKey, request.url);
  }

  return new Response(response.body, response.headers);
}

function canRequestProceed() {
  const min = 1;
  const max = Math.floor(100 / PERCENT_OF_REQUESTS);
  const randNum = Math.floor(Math.random() * (max - min + 1) + min);
  return randNum === 1;
}

async function circuitState(serviceKey, request) {
  const { serviceFailures, networkFailures, successes } = await failureCount(
    request
  );
  let failureKind;
  const service = await RESOURCES.get(serviceKey);
  const serviceObj = JSON.parse(service);
  const state = serviceObj.state;
  const response = { state };
  if (
    (state === "CLOSED" && serviceFailures >= SERVICE_FAILURE_THRESHOLD) ||
    networkFailures >= NETWORK_FAILURE_THRESHOLD
  ) {
    failureKind =
      serviceFailures >= SERVICE_FAILURE_THRESHOLD
        ? "Service failure"
        : "Network failure";
    await flipState({ serviceKey, newState: "OPEN", failureKind });
  } else if (state === "OPEN") {
    const now = Date.now();
    const oldDate = Number(serviceObj.updatedTime);
    const differenceInSecs = (now - oldDate) / 1000;
    if (differenceInSecs >= ERROR_TIMEOUT) {
      await flipState({ serviceKey, newState: "HALF-OPEN" });
      response.state = "HALF-OPEN";
    }
    response.failureKind = failureKind;
  } else if (state === "HALF-OPEN") {
    if (successes >= 1) {
      await flipState({ serviceKey, newState: "CLOSED" });
    } else if (
      networkFailures >= NETWORK_FAILURE_THRESHOLD ||
      serviceFailures >= SERVICE_FAILURE_THRESHOLD
    ) {
      await flipState({ serviceKey, newState: "OPEN" });
    }
  }
  return response;
}

async function flipState({ serviceKey, newState, obj = {} }) {
  const service = await RESOURCES.get(serviceKey);
  const serviceObj = JSON.parse(service);
  serviceObj.state = newState;
  serviceObj.updatedTime = Date.now().toString();
  await RESOURCES.put(serviceKey, JSON.stringify(serviceObj), obj);
}

async function failureCount(request) {
  const list = await FAILURES.list();
  const failures = list.keys.filter((obj) => obj.name.includes(request.url));
  const serviceFailures = failures.filter((obj) =>
    obj.name.includes("@SERVICE_FAILURE_")
  ).length;
  const networkFailures = failures.filter((obj) =>
    obj.name.includes("@NETWORK_FAILURE_")
  ).length;
  const successes = failures.filter((obj) => obj.name.includes("@SUCCESS_"))
    .length;
  return { serviceFailures, networkFailures, successes };
}

async function processRequest(request) {
  let timeoutId;
  const timeoutPromise = new Promise((resolutionFunc, rejectionFunc) => {
    timeoutId = setTimeout(() => {
      resolutionFunc({ failure: true, kvKey: "@NETWORK_FAILURE_" + rand() });
    }, MAX_LATENCY);
  });
  const fetchPromise = fetch(SERVICE).then(async (data) => {
    clearTimeout(timeoutId);
    let failure = false;
    let kvKey = "@SUCCESS_" + rand();
    const body = await data.body;
    const headers = await data.headers;
    const status = await data.status;
    if (Number(status) >= 500) {
      failure = true;
      kvKey = "@SERVICE_FAILURE_" + rand();
    }
    return { body, headers, failure, kvKey };
  });
  return await Promise.race([fetchPromise, timeoutPromise]).then((value) => {
    return value;
  });
}

async function updateKVFailures(kvkey, url) {
  await FAILURES.put(kvkey + url, Date.now().toString(), {
    expirationTtl: TIMESPAN,
  });
}

function rand() {
  const alphanum = "abcdefghijklmnopqrstuvwxyz0123456789";
  const one = Math.floor(Math.random() * 36);
  const two = Math.floor(Math.random() * 36);
  const three = Math.floor(Math.random() * 36);
  return alphanum[one] + alphanum[two] + alphanum[three] + "_";
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
