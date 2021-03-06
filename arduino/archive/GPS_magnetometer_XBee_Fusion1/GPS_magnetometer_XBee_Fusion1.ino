// Magetometer Libraries
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

//GPS Library
#include <Adafruit_GPS.h>

//XBee Preamble

#define XBeeSerial Serial1 //Teensy Ports 0/RX1 and 1/TX1

//GPS Preamble

#define GPSSerial Serial2 //Teensy Ports 9/RX2 and 10/TX2

// Connect to the GPS on the hardware port
Adafruit_GPS GPS(&GPSSerial);
     
// Set GPSECHO to 'false' to turn off echoing the GPS data to the Serial console
// Set to 'true' if you want to debug and listen to the raw GPS sentences
#define GPSECHO false

uint32_t timer = millis();
uint32_t timer1 = millis();
float Pi = 3.14159;

String currLatLong;
String timeString;
String compassString;
String stringOut;

float min_x;
float max_x;
float min_y;
float max_y;
float min_z;
float max_z;
float calibrated_x;
float calibrated_y;
float calibrated_z;

//Magnetometer Preamble

/* Assign a unique ID to this sensor at the same time */
//Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);

void displaySensorDetails(void)
{
  sensor_t sensor;
  mag.getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println(" uT");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println(" uT");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println(" uT");
  Serial.println("------------------------------------");
  Serial.println("");
  delay(500);
}

void setup()
{
  //GPS Setup
  
  //while (!Serial);  // uncomment to have the sketch wait until Serial is ready
  
  // connect at 115200 so we can read the GPS fast enough and echo without dropping chars
  // also spit it out
  Serial.begin(9600);  //Change to 9600 for Serial connect to Raspberry Pi
  Serial.println("Adafruit GPS library basic test!");
     
  // 9600 NMEA is the default baud rate for Adafruit MTK GPS's- some use 4800
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
  
  // Ask for firmware version
  GPSSerial.println(PMTK_Q_RELEASE);

  currLatLong = "null";

  //Magnetometer Setup

//  #ifndef ESP8266
//    while (!Serial);     // will pause Zero, Leonardo, etc until serial console opens
//  #endif
//  //Serial.begin(9600);
//  Serial.println("Magnetometer Test"); Serial.println("");
//
//  /* Enable auto-gain */
//  mag.enableAutoRange(true);
//
//  /* Initialise the sensor */
//  if(!mag.begin())
//  {
//    /* There was a problem detecting the LSM303 ... check your connections */
//    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
//    while(1);
//  }

  sensors_event_t event;
  mag.getEvent(&event);

  min_x = event.magnetic.x;
  max_x = event.magnetic.x;
  min_y = event.magnetic.y;
  max_y = event.magnetic.y;
  min_z = event.magnetic.z;
  max_z = event.magnetic.z;
  
  /* Display some basic information on this sensor */
//  displaySensorDetails();

  XBeeSerial.begin(9600);
}

void loop() // run over and over again
{
  // read data from the GPS in the 'main loop'
  char c = GPS.read();
  // if you want to debug, this is a good time to do it!
  if (GPSECHO)
    if (c) Serial.print(c);
  // if a sentence is received, we can check the checksum, parse it...
  if (GPS.newNMEAreceived()) {
    // a tricky thing here is if we print the NMEA sentence, or data
    // we end up not listening and catching other sentences!
    // so be very wary if using OUTPUT_ALLDATA and trytng to print out data
//    Serial.println(GPS.lastNMEA()); // this also sets the newNMEAreceived() flag to false
    if (!GPS.parse(GPS.lastNMEA())) // this also sets the newNMEAreceived() flag to false
      return; // we can fail to parse a sentence in which case we should just wait for another
  }
  // if millis() or timer wraps around, we'll just reset it
  if (timer > millis()) timer = millis();
  if (timer1 > millis()) timer1 = millis();
  if(XBeeSerial.available())
    {
      //Serial.print("Recieved Transmission: ");
      //Serial.println(XBeeSerial.read());
      Serial.print(XBeeSerial.read(),BYTE);
    }
  // approximately every 0.5 seconds or so, print out the current stats
  if (millis() - timer > 500) {
    timer = millis(); // reset the timer
//    Serial.print("\nTime: ");
//    Serial.print(GPS.hour, DEC); Serial.print(':');
//    Serial.print(GPS.minute, DEC); Serial.print(':');
//    Serial.print(GPS.seconds, DEC); Serial.print('.');
//    Serial.println(GPS.milliseconds);
//    Serial.print("Date: ");
//    Serial.print(GPS.day, DEC); Serial.print('/');
//    Serial.print(GPS.month, DEC); Serial.print("/20");
//    Serial.println(GPS.year, DEC);
//    Serial.print("Fix: "); Serial.print((int)GPS.fix);
//    Serial.print(" quality: "); Serial.println((int)GPS.fixquality);
    if (GPS.fix) {
//      Serial.print("Location: ");
//      Serial.print(GPS.latitude, 4); Serial.print(GPS.lat);
//      Serial.print(", ");
//      Serial.print(GPS.longitude, 4); Serial.println(GPS.lon);
//      Serial.print("Speed (knots): "); Serial.println(GPS.speed);
//      Serial.print("Angle: "); Serial.println(GPS.angle);
//      Serial.print("Altitude: "); Serial.println(GPS.altitude);
//      Serial.print("Satellites: "); Serial.println((int)GPS.satellites);

      currLatLong = String("GPS") + "Loc" + String(fabs(GPS.latitudeDegrees), 6) + GPS.lat + String(fabs(GPS.longitudeDegrees), 6) + GPS.lon;
    }
    else {
      currLatLong = String("GPS") + "Loc" + "null";
      }
//    Serial.print("Output Processed LatLong String: "); Serial.println(currLatLong);

    timeString = String("Time") + String(GPS.minute,DEC) + ":" + String(GPS.seconds,DEC) + "." + String(GPS.milliseconds);

<<<<<<< HEAD
//    // Magnetometer Output
//    sensors_event_t event;
//    mag.getEvent(&event);
//    
//    float heading = (atan2(event.magnetic.y,event.magnetic.x) * 180) / Pi + 14.33; //Includes Magnetic Declination Correction
//    if (heading < 0)
//    {
//      heading = 360 + heading;
//    }
////    Serial.print("Compass Heading: ");
////    Serial.println(heading);
//
//    compassString = String("Heading") + String(heading) + "deg";

//    stringOut = String(currLatLong) + timeString + compassString;
      stringOut = String(currLatLong) + timeString;
=======
    // Magnetometer Output
    sensors_event_t event;
    mag.getEvent(&event);

    min_x=min(event.magnetic.x,min_x);
    min_y=min(event.magnetic.y,min_y);
    min_z=min(event.magnetic.z,min_z);
    max_x=max(event.magnetic.x,max_x);
    max_y=max(event.magnetic.y,max_y);
    max_z=max(event.magnetic.z,max_z);
    calibrated_x=event.magnetic.x-(max_x+min_x)/2;
    calibrated_y=event.magnetic.y-(max_y+min_y)/2;
    calibrated_z=event.magnetic.z-(max_z+min_z)/2;
    
    float heading = (atan2(calibrated_y,calibrated_x) * 180) / Pi + 14.63; //Includes Magnetic Declination Correction
    if (heading < 0)
    {
      heading = 360 + heading;
    }
//    Serial.print("Compass Heading: ");
//    Serial.println(heading);

    compassString = String("Heading") + String(heading) + "deg";

    stringOut = String(currLatLong) + timeString + compassString;
>>>>>>> 92b8a03095c929059de101e6840ecc4f096c9cf5

//    char charBuf[65];
//    stringOut.toCharArray(charBuf, 65);
//    XBeeSerial.print(charBuf,BYTE);

    XBeeSerial.println(stringOut);

//    if(Serial.available())
//  {
//    Serial1.print(Serial.read(), BYTE);
//  }
  }

  
}
