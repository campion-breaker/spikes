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

// const results = [];

const testLatency = (path, service, platform, destination) => {
  const times = {
    path,
    service,
    platform,
    requestSent: Date.now(),
  };

  return fetch(path).then((data) => {
    times.responseReceived = Date.now();
    times.status = data.status;
    times.latency = times.responseReceived - times.requestSent;
    destination.push(times);
  });
  // .catch(() => {
  //   times.timeoutAt = Date.now();
  //   times.timeout = times.timeoutAt - times.requestSent;
  //   results.push(times);
  // });
};

const runTest = async (path, platform, destination) => {
  for (let i = 0; i < 10; i += 1) {
    await testLatency(path, "Success", platform, destination);
  }
  let totalTime = 0;
  destination.forEach((req) => (totalTime += req.latency));

  destination.forEach((r) => console.log(r.platform, r.status, r.latency));
  console.log(
    platform,
    Math.floor(totalTime / destination.length),
    "------------------------------------------------------"
  );
};

runTest("https://syd.mirror.rackspace.com/archlinux/", "Control", []);
runTest("http://d1wbfajts7umn1.cloudfront.net/", "LambdaEdge", []);
runTest("https://campion.gabedealmeida.workers.dev/", "Workers", []);
runTest(
  "https://r6l425wws8.execute-api.us-east-2.amazonaws.com/CampionTesting/campionTester",
  "Lambda",
  []
);
