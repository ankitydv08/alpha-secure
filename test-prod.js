async function test() {
  const url = "https://begxsecure.vercel.app/api/scan/cmpsuwypo000004k1ud07li5c";
  const res = await fetch(url, { method: "POST" });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
