let device, server, service, dataChar, controlChar;

let eegData = [], ecgData = [], emgData = [];
const maxPoints = 100;

// UUIDs used in your Arduino BLE code
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const DATA_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const CONTROL_CHAR_UUID = "0000ff01-0000-1000-8000-00805f9b34fb";

// Bind connect button
document.querySelectorAll("button").forEach(btn => {
  if (btn.textContent.trim().toLowerCase() === "connect") {
    btn.addEventListener("click", connectBLE);
  }
});

async function connectBLE() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Neuro" }],
      optionalServices: [SERVICE_UUID]
    });

    server = await device.gatt.connect();
    service = await server.getPrimaryService(SERVICE_UUID);

    dataChar = await service.getCharacteristic(DATA_CHAR_UUID);
    controlChar = await service.getCharacteristic(CONTROL_CHAR_UUID);

    // Start receiving data
    await dataChar.startNotifications();
    dataChar.addEventListener("characteristicvaluechanged", handleData);

    // Start the stream
    await controlChar.writeValue(new TextEncoder().encode("START"));

    console.log("✅ Connected & Streaming Started");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);

  const eegMatch = value.match(/EEG:(\d+),%:(\d+\.\d+)/);
  const ecgMatch = value.match(/ECG:(\d+),%:(\d+\.\d+)/);
  const emgMatch = value.match(/EMG:(\d+),%:(\d+\.\d+)/);

  if (eegMatch) updateEEGGraph(parseInt(eegMatch[1]));
  if (ecgMatch) updateECGGraph(parseInt(ecgMatch[1]));
  if (emgMatch) updateEMGGraph(parseInt(emgMatch[1]));

  console.log(value);
}

// Update EEG graph data
function updateEEGGraph(val) {
  eegData.push(val);
  if (eegData.length > maxPoints) eegData.shift();
  // You can render EEG chart here
}

// Update ECG graph data
function updateECGGraph(val) {
  ecgData.push(val);
  if (ecgData.length > maxPoints) ecgData.shift();
  // You can render ECG chart here
}

// Update EMG graph data
function updateEMGGraph(val) {
  emgData.push(val);
  if (emgData.length > maxPoints) emgData.shift();
  // You can render EMG chart here
}
