async function run() {
  try {
    const res = await fetch('http://localhost:8080/api/products/apple-usb-c-1m-60w-woven-charge-cable-mgk3zm-white');
    console.log("STATUS:", res.status);
    const data = await res.json();
    console.log("DATA:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
run();
