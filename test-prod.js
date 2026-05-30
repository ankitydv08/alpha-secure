async function test() {
  const url = "https://begxsecure.vercel.app/api/scan/cmpsuqsso000004jjabvdpouo";
  const res = await fetch(url, { method: "POST" });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
