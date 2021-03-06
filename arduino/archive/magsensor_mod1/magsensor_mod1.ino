#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>
float min_x;
float max_x;
float min_y;
float max_y;
float min_z;
float max_z;
float calibrated_x;
float calibrated_y;
float calibrated_z;

/* Assign a unique ID to this sensor at the same time */
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);

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

void setup(void)
{
#ifndef ESP8266
  while (!Serial);     // will pause Zero, Leonardo, etc until serial console opens
#endif
  Serial.begin(9600);
  Serial.println("Magnetometer Test"); Serial.println("");

  /* Enable auto-gain */
  mag.enableAutoRange(true);

  /* Initialise the sensor */
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }

  sensors_event_t event;
  mag.getEvent(&event);

  min_x = event.magnetic.x;
  max_x = event.magnetic.x;
  min_y = event.magnetic.y;
  max_y = event.magnetic.y;
  min_z = event.magnetic.z;
  max_z = event.magnetic.z;
  
  /* Display some basic information on this sensor */
  displaySensorDetails();
}

void loop(void)
{
  /* Get a new sensor event */
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

  /* Display the results (magnetic vector values are in micro-Tesla (uT)) */
  Serial.print("X: "); Serial.print(event.magnetic.x); Serial.print("  ");
  Serial.print("Y: "); Serial.print(event.magnetic.y); Serial.print("  ");
  Serial.print("Z: "); Serial.print(event.magnetic.z); Serial.print("  ");Serial.println("uT");
  Serial.print("X: "); Serial.print(calibrated_x); Serial.print("  ");
  Serial.print("Y: "); Serial.print(calibrated_y); Serial.print("  ");
  Serial.print("Z: "); Serial.print(calibrated_z); Serial.print("  ");Serial.println("uT");

  float Pi = 3.14159;
  float heading = (atan2(calibrated_y,calibrated_x) * 180) / Pi + 14.63;
  if (heading < 0)
  {
    heading = 360 + heading;
  }
  Serial.print("Compass Heading: ");
  Serial.println(heading);

  /* Note: You can also get the raw (non unified values) for */
  /* the last data sample as follows. The .getEvent call populates */
  /* the raw values used below. */
  // Serial.print("X Raw: "); Serial.print(mag.raw.x); Serial.print("  ");
  // Serial.print("Y Raw: "); Serial.print(mag.raw.y); Serial.print("  ");
  // Serial.print("Z Raw: "); Serial.print(mag.raw.z); Serial.println("");

  /* Delay before the next sample */
  delay(5);
}
