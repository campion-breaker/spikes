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

const runTest = async (path, platform) => {
  for (let i = 0; i < 200
    ; i += 1) {
    await testLatency(path, "Success", platform);
  }
  let totalTime = 0;
  results.forEach((req) => (totalTime += req.latency));

  // results.forEach((r) => console.log(r.platform, r.latency));
  console.log(
    platform,
    Math.floor(totalTime / results.length),
    "------------------------------------------------------"
  );
};

runTest("https://arthurk.dev/", "Control");
runTest("http://d1wbfajts7umn1.cloudfront.net/", "LambdaEdge");
runTest("https://campion.gabedealmeida.workers.dev/", "Workers");
runTest(
  "https://i9orjrmvuc.execute-api.us-east-1.amazonaws.com/default/campion",
  "Lambda"
);
