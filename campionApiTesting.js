const email = 'arthur@sent.com';
const apiKey = '7d24e00950504429425723184b634b4b6366e';

async function getAccountId() {
  const data = await fetch("https://api.cloudflare.com/client/v4/accounts", { 
    headers: {
      'X-Auth-Email': email,
      'X-Auth-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });
  const body = await data.body.json();
  return body.result[0].id;
};

