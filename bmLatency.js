// const lambdas = {
//   success: "https://steep-pond-5efd.bziggz.workers.dev/",
//   timeout: "https://divine-bird-2673.bziggz.workers.dev/",
//   serviceDown: "https://broken-rice-127c.bziggz.workers.dev/",
// };

// const workers = {
//   success: "",
//   timeout: "",
//   serviceDown: "",
// };

// const direct = {
//   success: "https://steep-pond-5efd.bziggz.workers.dev/",
//   timeout: "https://divine-bird-2673.bziggz.workers.dev/",
//   serviceDown: "https://broken-rice-127c.bziggz.workers.dev/",
// };

const results = [];

const testLatency = (path, service, platform) => {
  const times = {
    path,
    service,
    platform,
    requestSent: Date.now(),
  };

  return fetch(path).then(() => {
    times.responseReceived = Date.now();
    times.latency = times.responseReceived - times.requestSent;
    results.push(times);
  });
  // .catch(() => {
  //   times.timeoutAt = Date.now();
  //   times.timeout = times.timeoutAt - times.requestSent;
  //   results.push(times);
  // });
};

const runTest = async () => {
  for (let i = 0; i < 20; i += 1) {
    await testLatency(
      "https://i9orjrmvuc.execute-api.us-east-1.amazonaws.com/default/campion",
      "Success",
      "Lambdas"
    );
  }
  let totalTime = 0;
  results.forEach((req) => (totalTime += req.latency));

  console.log(results);
  console.log(Math.floor(totalTime / results.length));
};

runTest();
