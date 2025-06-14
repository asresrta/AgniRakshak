#include <dht.h>

#define DHTPIN 7
#define MQ2PIN A1

dht DHT;

void setup() {
  Serial.begin(9600); // Now this talks directly to HC-05
}

void loop() {
  int dhtStatus = DHT.read11(DHTPIN);
  int mq2Value = analogRead(MQ2PIN);

  if (dhtStatus == DHTLIB_OK) {
    float temp = DHT.temperature;
    float hum = DHT.humidity;

    String data = "TEMP:" + String(temp) + "C, HUM:" + String(hum) + "%, MQ2:" + String(mq2Value);
    Serial.println(data); // Sent directly to HC-05
  } else {
    Serial.println("DHT error");
  }

  delay(2000);
}
