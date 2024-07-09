from app import socketio
from flask_socketio import emit

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('room_booked')
def handle_room_booked(data):
    emit('room_status_update', data, broadcast=True)
