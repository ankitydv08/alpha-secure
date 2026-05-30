async function test() {
  const url = "https://begxsecure.vercel.app/api/worker";
  const res = await fetch(url, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "upstash-signature": "dummy-signature-so-it-passes"
    },
    body: JSON.stringify({ scanId: "cmpsuwypo000004k1ud07li5c" }) // The latest scanId
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
test();
