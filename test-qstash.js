const qstashToken = "eyJVc2VySUQiOiJlNGQzODViOC1hZGI0LTQwN2EtOWQ2Yy01ZGQzZDI3YTdjMWUiLCJQYXNzd29yZCI6IjFiYmRhNWQyYjBhNTRmY2ViNjhiNmE0ODFkN2FlNDQ4In0=";
const workerUrl = "https://begxsecure.vercel.app/api/worker";
const qstashBaseUrl = "https://qstash-us-east-1.upstash.io";

async function test() {
  const url = `${qstashBaseUrl}/v2/publish/${workerUrl}`; // Without encodeURIComponent
  // const url = `${qstashBaseUrl}/v2/publish/${encodeURIComponent(workerUrl)}`; // With encodeURIComponent
  
  console.log("Testing QStash POST to:", url);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer "${qstashToken}"`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scanId: "test-scan-id" }),
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
