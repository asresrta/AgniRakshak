from flask import Flask, jsonify
from flask_cors import CORS
import serial
import threading
import time
import re

from keys import auth_token, account_sid

#step-1 install required libraries
from twilio.rest import Client

#step-2 twilio credentials


client =Client(account_sid, auth_token)

#step 3

def dr():
    recipient_number = +9779742410240
    message_body = "Alert! Fire/Gas detected"
    try:
        message = client.messages.create(
            from_="whatsapp:+14155238886",
            body=message_body,
            to=f'whatsapp:{recipient_number}'
        )
        print(f'Message sent successfully! Message SID{message.sid}')
    except Exception as e:
        print('An error occured')

app = Flask(__name__)
CORS(app)

bt_port = 'COM5'  # Your port
baud_rate = 9600

latest_data = {
    'temperature': None,
    'humidity': None,
    'mq2': None,
    'timestamp': None
}

def read_serial_continuously():
    try:
        ser = serial.Serial(bt_port, baud_rate, timeout=2)
        print(f"Connected to {bt_port}")

        while True:
            line = ser.readline().decode('utf-8').strip()
            if line:
                print("Received:", line)
                pattern = r'TEMP:(?P<temp>[\d.]+)C.*?HUM:(?P<hum>[\d.]+)%.*?MQ2:(?P<gas>\d+)'
                match = re.search(pattern, line)
                if match:
                    latest_data['temperature'] = float(match.group('temp'))
                    latest_data['humidity'] = float(match.group('hum'))
                    latest_data['mq2'] = int(match.group('gas'))
                    latest_data['timestamp'] = int(time.time())
                    
                    if (latest_data['mq2'] > 100 or latest_data['humidity'] < 10 or latest_data['temperature'] > 35):
                        dr()

                else:
                    print("Could not parse the string.")
            time.sleep(0.5)  # small delay to avoid busy waiting

    except serial.SerialException as e:
        print("Serial Error:", e)
    except KeyboardInterrupt:
        print("Exiting serial thread gracefully...")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

@app.route('/api/temp', methods=['GET'])
def get_temp():
    if latest_data['temperature'] is None:
        return jsonify({'error': 'Sensor data not available'}), 500

    return jsonify(latest_data)

if __name__ == '__main__':
    # Start serial reading in a background thread
    serial_thread = threading.Thread(target=read_serial_continuously, daemon=True)
    serial_thread.start()

    app.run(debug=True, use_reloader=False)  # use_reloader=False important to avoid starting thread twice
