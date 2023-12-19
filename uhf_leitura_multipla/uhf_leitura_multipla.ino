//João Carlos Calmon - RA: 15.118.161-7

#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include "Unit_UHF_RFID.h"

//Wifi settings
WiFiMulti WiFiMulti;
const char* ssid = "AndroidAP1F99";
const char* password = "00007777";

//socket server
SocketIOclient socketIO;

//
int port = 5000;
char host[] = "192.168.43.219";

//M5stack Object
Unit_UHF_RFID uhf;
String info = "";

//localizacao do sensor
const char* bloco = "A";
const char* coord_x = "l2";
const char* coord_y = "c3";

//variavel que ativa envio da localizaçao
bool ativarLocation = false;

#define USE_SERIAL Serial

//Orquestra os eventos no socket
void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
        {
            char * sptr = NULL;
            int id = strtol((char *)payload, &sptr, 10);
            USE_SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
            if(id) {
                payload = (uint8_t *)sptr;
            }
            DynamicJsonDocument doc(1024);
            DeserializationError error = deserializeJson(doc, payload, length);
            if(error) {
                USE_SERIAL.print(F("deserializeJson() failed: "));
                USE_SERIAL.println(error.c_str());
                return;
            }
            String eventName = doc[0];
            String value = doc[1];

            USE_SERIAL.printf("[IOc] event name: %s\n", eventName.c_str());

            //evento -> evento usado para cadastrar a tag ao produto
            if(eventName == "tags"){
          
              enviandoTags("leituraTags","");
            }
            //evento -> se entrar na pagina ativa leitura
            if(eventName == "entrando"){
              ativarLocation = true;
            }
            //evento-> se sair da pagina desativa a leitura
            if(eventName == "saindo"){
              ativarLocation = false;
            }
        }
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            break;
    }
}

String hex2str(String numHex) {
  const String hexDigits = "0123456789ABCDEF";
  numHex.toUpperCase();
  int result = 0;
  for (int i = 0; i < numHex.length(); i++) {
    result <<= 4;
    result |= hexDigits.indexOf(numHex[i]);
  }
  return String(result);
}

//função que faz a leitura da tag a ser associada ao produto 
void enviandoTags(String event, String localizaTag){
  bool status = false;
  int count = 0;
  while(1){  

    uint8_t result = uhf.pollingOnce();
    Serial.printf("%d Tags Lidas \r\n", result);  
    if (result > 0) {
      //criando payload
      DynamicJsonDocument doc(1024);
      JsonArray array = doc.to<JsonArray>();
      array.add(event);
      JsonObject param1 = array.createNestedObject();

      for (uint8_t i = 0; i < result; i++) {
        
        Serial.println("rssi: " + hex2str(uhf.cards[i].rssi_str));
        Serial.println("epc: " + uhf.cards[i].epc_str.substring(16));
        Serial.println("-----------------"); 
        String epc = uhf.cards[i].epc_str.substring(16);

        if (event == "leituraTags" &&  epc != ""){
          param1[String(i)] = epc;
          status = true;
          break;
        }
      } 
      if (status == true){
        String output;
        serializeJson(doc, output);
        socketIO.sendEVENT(output);
        break;
      }  
    }
    if(count == 10){
          USE_SERIAL.printf("Não foi possivel encontrar a TAG\n");
          break;
    }
      count++;
  } 
}

void setup() {
    USE_SERIAL.begin(115200);

    //Serial.setDebugOutput(true);
    USE_SERIAL.setDebugOutput(true);

    WiFiMulti.addAP(ssid, password);

    // WiFi.disconnect()
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }
    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin(host, port, "/socket.io/?EIO=4");
    Serial.println("Conectado ao Socket io");
    
    // event handler
    socketIO.onEvent(socketIOEvent);

    //RFID LIBRARY -> 115200 baud UART
    uhf.begin(&Serial2, 115200, 16, 17, false);
    Serial.println("Iniciando Leitor M5STACK");
    
    //aguarda o leitor entrar em funcionamento 
    while (1) {
        info = uhf.getVersion();
        if (info != "ERROR") {
            Serial.println(info);
            break;
        }
        else{
          Serial.println(info);
        }
    }

    //set 19dB ~ 26dB
    uhf.setTxPower(2600);
    Serial.println("SET 26dB");
}


unsigned long messageTimestamp = 0;
void loop() {

    //loop do socket io para lidar com as mensagens recebidas
    socketIO.loop();

    //se tiver conectado ao socket
    if (socketIO.isConnected()){

      //ativa a leitura se o usuario entrar na pagina web para localizar o produto
      if(ativarLocation == true){
      
        uint64_t now = millis();

        //manda mensagem a cada 2s
        if(now - messageTimestamp > 2000) {
            messageTimestamp = now;

            // creat JSON message para o Socket.IO (event)
            DynamicJsonDocument doc(1024);
            JsonArray array = doc.to<JsonArray>();

            // add nome evento
            array.add("localizar");

            // add payload (parameters) para o evento
            JsonObject param1 = array.createNestedObject();

            //ativa o leitor 
            uint8_t result = uhf.pollingMultiple(50);

            //se houver leitura
            if (result > 0) {

            //faz a leitura dos buffers de memoria  
            for (uint8_t i = 0; i < result; i++) {
            
            Serial.println("rssi: " + hex2str(uhf.cards[i].rssi_str));
            Serial.println("epc: " + uhf.cards[i].epc_str.substring(16));
            Serial.println("-----------------"); 
            String epc = uhf.cards[i].epc_str.substring(16);

            param1[String(i)] = epc;
            }
          }
            //parametros de localização do leitor
            param1["linha"] = coord_x; 
            param1["coluna"] = coord_y;
            param1["bloco"] = bloco;

            // JSON to String (serializion)
            String output;
            serializeJson(doc, output);

            // Send evento
            socketIO.sendEVENT(output);

            // Print JSON para debugging
            USE_SERIAL.println(output);
        }
      }
    }
  }



