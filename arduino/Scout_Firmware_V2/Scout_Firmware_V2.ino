/*
 * Queen Serial: SH -> 0x13A200, SL -> 0x41515876
 * Scout 1 Serial: SH -> 0x13A200, SL -> 0x4164D65A
 */

//Libraries
#include <XBee.h> //XBee library
#include <Adafruit_GPS.h> //Adafruit GPS library

#define XBeeSerial Serial1 //Teensy Ports 0/RX1 and 1/TX1
XBee xbee = XBee(); //Create XBee object
XBeeResponse response = XBeeResponse();
ZBRxResponse rx = ZBRxResponse();

uint8_t payload[25] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
//uint8_t payload[13] = {0,0,0,0,0,0,0,0,0,0,0,0,0};
XBeeAddress64 addr64 = XBeeAddress64(0x13A200, 0x41515876);
ZBTxRequest zbTx = ZBTxRequest(addr64, payload, sizeof(payload));
ZBTxStatusResponse txStatus = ZBTxStatusResponse();

volatile uint8_t poiPayload[12] = {0,0,0,0,0,0,0,0,0,0,0,0};

#define GPSSerial Serial2 //Teensy Ports 9/RX2 and 10/TX2
// Connect to the GPS on the hardware port
Adafruit_GPS GPS(&GPSSerial);
     
// Set GPSECHO to 'false' to turn off echoing the GPS data to the Serial console
// Set to 'true' if you want to debug and listen to the raw GPS sentences
#define GPSECHO false

uint32_t timer = millis();
uint32_t timer1 = millis();
float Pi = 3.14159;

int count = 0x00;

float GPSlat = 42.047843;
float GPSlon = 21.308923;

unsigned long latTX;
unsigned long lonTX;

String currLatLong;
String timeString;
String compassString;
String stringOut;

int statusLed = 13;
int buttonPin = 15;

volatile unsigned long last_interrupt;

void flashLed(int pin, int times, int wait) {

  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(wait);
    digitalWrite(pin, LOW);

    if (i + 1 < times) {
      delay(wait);
    }
  }
}

void setup() {
  Serial.begin(9600);
    GPS.begin(9600);
  // uncomment this line to turn on RMC (recommended minimum) and GGA (fix data) including altitude
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  // uncomment this line to turn on only the "minimum recommended" data
  //GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCONLY);
  // For parsing data, we don't suggest using anything but either RMC only or RMC+GGA since
  // the parser doesn't care about other sentences at this time
  // Set the update rate
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ); // 1 Hz update rate
  // For the parsing code to work nicely and have time to sort thru the data, and
  // print it out we don't suggest using anything higher than 1 Hz
     
  // Request updates on antenna status, comment out to keep quiet
  GPS.sendCommand(PGCMD_ANTENNA);

  delay(1000);

  XBeeSerial.begin(9600);
  xbee.setSerial(XBeeSerial);
  pinMode(statusLed, OUTPUT);
  pinMode(buttonPin, INPUT);
  digitalWrite(buttonPin, HIGH);
  attachInterrupt(buttonPin,markWaypoint,FALLING);
}

void loop() {
  xbee.readPacket();
  if(xbee.getResponse().isAvailable()){
    if(xbee.getResponse().getApiId() == ZB_RX_RESPONSE){
      flashLed(statusLed, 1,100);
      xbee.getResponse().getZBRxResponse(rx);
      if(rx.getDataLength() == 5){
        char c = GPS.read();
        if (GPS.newNMEAreceived()) {
            if (!GPS.parse(GPS.lastNMEA())) // this also sets the newNMEAreceived() flag to false
              return; // we can fail to parse a sentence in which case we should just wait for another
          }
//          float GPSlat = GPS.latitude;
//          float GPSlon = GPS.longitude;
          Serial.println("Request Recieved");
          latTX = (long) (GPSlat*1000000);
          lonTX = (long) (GPSlon*1000000);
          payload[0] = latTX & 255;
          payload[1] = (latTX >> 8) & 255;  
          payload[2] = (latTX >> 16) & 255;
          payload[3] = (latTX >> 24) & 255;
          payload[4] = 0x01;
          payload[5] = lonTX & 255;
          payload[6] = (lonTX >> 8) & 255;  
          payload[7] = (lonTX >> 16) & 255;
          payload[8] = (lonTX >> 24) & 255;
          payload[9] = 0x01;
          payload[10] = 0x01;
          payload[11] = 0x01;
          payload[12] = count;
          count += 1;
          if (count == 0xFF) {
            count = 0x00;
          }
          if(poiPayload[11]!=0x00){
            for(int i=0;i<12;i++){
              payload[i+13] = poiPayload[i];
              poiPayload[i] = 0;
            }
          }
          xbee.send(zbTx);
          Serial.println("Reply Sent");
          for(int i=0;i<25;i++){
            payload[i] = 0x00;
          }
          flashLed(statusLed,5,50);
      }
    }
  }
}

void markWaypoint(){
  if (millis() - last_interrupt > 1000){
    char c = GPS.read();
    if (GPS.newNMEAreceived()) {
      if (!GPS.parse(GPS.lastNMEA())) // this also sets the newNMEAreceived() flag to false
        return; // we can fail to parse a sentence in which case we should just wait for another
    }
    //float GPSlat = GPS.latitude;
    //float GPSlon = GPS.longitude;
    float GPSlat = 42.047843;
    float GPSlon = 21.308923;
    
    unsigned long latTX;
    unsigned long lonTX;
    Serial.println("Button Pushed");
    latTX = (long) (GPSlat*1000000);
    lonTX = (long) (GPSlon*1000000);
    poiPayload[0] = latTX & 255;
    poiPayload[1] = (latTX >> 8) & 255;  
    poiPayload[2] = (latTX >> 16) & 255;
    poiPayload[3] = (latTX >> 24) & 255;
    poiPayload[4] = 0x01;
    poiPayload[5] = lonTX & 255;
    poiPayload[6] = (lonTX >> 8) & 255;  
    poiPayload[7] = (lonTX >> 16) & 255;
    poiPayload[8] = (lonTX >> 24) & 255;
    poiPayload[9] = 0x01;
    poiPayload[10] = 0x01;
    poiPayload[11] = 0x01;
  //  payload[13] = latTX & 255;
  //  payload[14] = (latTX >> 8) & 255;  
  //  payload[15] = (latTX >> 16) & 255;
  //  payload[16] = (latTX >> 24) & 255;
  //  payload[17] = 0x01;
  //  payload[18] = lonTX & 255;
  //  payload[19] = (lonTX >> 8) & 255;  
  //  payload[20] = (lonTX >> 16) & 255;
  //  payload[21] = (lonTX >> 24) & 255;
  //  payload[22] = 0x01;
  //  payload[23] = 0x01;
  //  payload[24] = 0x01;
    }
  last_interrupt = millis();
}

