from flask import Blueprint, request, jsonify
from models import db, Session, Room, RoomBookingDetails
import uuid
from app import socketio
import random
from faker import Faker

main = Blueprint('main', __name__)
fake = Faker()

@main.route('/generate-token', methods=['POST'])
def generate_token():
    token = str(uuid.uuid4())
    new_session = Session(accessToken=token)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({'accessToken': token})

@main.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    capacity = request.args.get('capacity')

    search_query = Room.query
    if query:
        search_query = search_query.filter(Room.roomName.contains(query))
    if capacity:
        search_query = search_query.filter(Room.capacity >= capacity)
    if query and capacity:
        search_query = search_query.filter(Room.roomName.contains(query), Room.capacity >= capacity)
    rooms = search_query.all()
    room_list = [{'roomID': room.roomID, 'roomName': room.roomName, 'capacity': room.capacity, 'tags': room.tags.split(',')} for room in rooms]

    return jsonify({'rooms': room_list})

@main.route('/book', methods=['POST'])
def book():
    data = request.json
    roomID = data['roomID']
    accessToken = data['accessToken']
    startTime = data['startTime']
    endTime = data['endTime']
    date = data['date']
    print(date)
    start_time_int = int(startTime.replace(':', ''))
    end_time_int = int(endTime.replace(':', ''))

    existing_bookings = RoomBookingDetails.query.filter_by(roomID=roomID, date=date).all()
    for booking in existing_bookings:
        booked_start_time_int = int(booking.startTime.replace(':', ''))
        booked_end_time_int = int(booking.endTime.replace(':', ''))

        if (start_time_int < booked_end_time_int and end_time_int > booked_start_time_int):
            return jsonify({'success': False, 'message': 'Room already booked for this time slot'})

    new_booking = RoomBookingDetails(
        roomID=roomID,
        accessToken=accessToken,
        startTime=startTime,
        endTime=endTime,
        date=date
    )

    db.session.add(new_booking)
    db.session.commit()

    socketio.emit('room_booked', {'roomID': roomID, 'date': date, 'startTime': startTime, 'endTime':endTime, 'accessToken': accessToken})

    return jsonify({'success': True, 'message': 'Room booked successfully'})


@main.route('/room/<int:id>', methods=['GET'])
def room_details(id):
    room = Room.query.get_or_404(id)
    bookings = RoomBookingDetails.query.filter_by(roomID=id).all()

    booking_list = [{'date': booking.date, 'startTime': booking.startTime, 'endTime': booking.endTime, 'accessToken':booking.accessToken,} for booking in bookings]

    room_details = {
        'roomID': room.roomID,
        'roomName': room.roomName,
        'capacity': room.capacity,
        'tags': room.tags.split(','),
        'bookings': booking_list
    }
    print(room_details)
    return jsonify(room_details)

@main.route('/rooms', methods=['GET'])
def get_all_rooms():
    rooms = Room.query.all()
    room_list = [{
        'roomID': room.roomID,
        'roomName': room.roomName,
        'capacity': room.capacity,
        'tags': room.tags.split(','),
    } for room in rooms]
    
    return jsonify({'rooms': room_list})

@main.route('/populate-rooms', methods=['POST'])
def populate_rooms():
    num_rooms = 1000
    for index in range(num_rooms):
        room = Room(
            roomName="Room "+str(index+1),
            capacity=random.choice([5,10,15,25,50,100,250,500,1000]),
            tags=','.join(fake.words(nb=random.randint(0, 3), ext_word_list=['projector', 'sound', 'large screen', 'wifi', 'air conditioning'],unique = True)),
        )
        db.session.add(room)
    db.session.commit()
    return jsonify({'success': True, 'message': f'{num_rooms} rooms added'})