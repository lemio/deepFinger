var myCharacteristic;
var myCharacteristicOUTPUT;

async function onStartButtonClick() {
  let serviceUuid = "19b10010-e8f2-537e-4f6c-d104768a1214";
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  let characteristicUuidOutput = "35ab6b10-d48e-11e9-bb65-2a2ae2dbcce4";
  if (characteristicUuidOutput.startsWith('0x')) {
    characteristicUuidOutput = parseInt(characteristicUuidOutput);
  }

  try {
    console.log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [serviceUuid]
      }]
    });

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    console.log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    var myCharacteristics = await service.getCharacteristics();
    
    myCharacteristic = myCharacteristics[0];
    myCharacteristicOUTPUT = myCharacteristics[1];
    /*
    console.log('Getting Characteristic...');
    myCharacteristicOUTPUT = await service.getCharacteristic(characteristicUuidOutput);

    console.log('Getting Characteristic...');
    myCharacteristic = await service.getCharacteristic(characteristicUuid);*/
    await myCharacteristic.startNotifications();

    console.log('> Notifications started');
    myCharacteristic.addEventListener('characteristicvaluechanged',
      handleNotifications);
  } catch (error) {
    console.log('Argh! ' + error);
  }
}

async function onStopButtonClick() {
  if (myCharacteristic) {
    try {
      await myCharacteristic.stopNotifications();
      console.log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
        handleNotifications);
    } catch (error) {
      console.log('Argh! ' + error);
    }
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    if (value.getUint8(i)== 1){
    physicalButtonPressed();
  }
  }
  console.log('> ' + a.join(' '));
}
var lastData = 0;
async function writeToESP( data) {
  if (lastData != data){
  console.log("writeToESP");
let encoder = new TextEncoder('utf-8');
  let value = "awesome";
  
  try {
    var resetEnergyExpended = Uint8Array.of(data);
    console.log('Setting Characteristic User Description...');
    await myCharacteristicOUTPUT.writeValue(resetEnergyExpended);

    console.log('> Characteristic User Description changed to: ' + value);
  } catch(error) {
    console.log('Argh! ' + error);
  }
  }
  lastData = data;
}
/*
var myCharacteristic;

function onStartButtonClick() {
  let serviceUuid = "19b10010-e8f2-537e-4f6c-d104768a1214";
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }
  
  let characteristicUuidOutput = "35ab6b10-d48e-11e9-bb65-2a2ae2dbcce4";
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
  .then(device => {
    console.log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    console.log('Getting Service...');
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    console.log('Getting Characteristic...');
    return service.getCharacteristic(characteristicUuid);
  })
  .then(characteristic => {
    myCharacteristic = characteristic;
    return myCharacteristic.startNotifications().then(_ => {
      console.log('> Notifications started');
      myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
    });
  })
  
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

function onStopButtonClick() {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
    .then(_ => {
      console.log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
  }
}
function writeToESP(data){
  if (myCharacteristic2){
    myCharacteristic2.writeValue(encoder.encode(value))
  .then(_ => {
    log('> Characteristic User Description changed to: ' + value);
  })
  .catch(error => {
    log('Argh! ' + error);
  });   
  }else{
    service.getCharacteristic(characteristicUuidOUTPUT).then(char => {
    myCharacteristic2 = char;
    });
    
    writeToESP(data);
  }
  
    console.log('Getting Characteristic2...');
  
  
}
function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));
}
*/