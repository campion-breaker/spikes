const lambdas = {
  success: "https://steep-pond-5efd.bziggz.workers.dev/",
  timeout: "https://divine-bird-2673.bziggz.workers.dev/",
  serviceDown: "https://broken-rice-127c.bziggz.workers.dev/",
};

const workers = {
  success: "",
  timeout: "",
  serviceDown: "",
};

const direct = {
  success: "https://steep-pond-5efd.bziggz.workers.dev/",
  timeout: "https://divine-bird-2673.bziggz.workers.dev/",
  serviceDown: "https://broken-rice-127c.bziggz.workers.dev/",
};

const results = [];

const testLatency = (path, service) => {
  const times = {
    path,
    service,
    requestSent: Date.now(),
  };

  fetch(urls[path]).then(() => {
    times.responseReceived = Date.now();
    times.latency = times.responseReceived - times.requestSent;
  }).catch(() => {
    times.timeoutAt = Date.now();
    times.timeout = times.timeoutAt - times.requestSent;
  });

  results.push(times);
};

testLatency();

console.log(results);
