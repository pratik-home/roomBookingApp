from flask import Blueprint, request, jsonify
from models import db, Session, Room, RoomBookingDetails
from middleware import authenticate
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
@authenticate
def search():
    query = request.args.get('query')
    capacity = request.args.get('capacity')
    tags = request.args.get('tags')
    time = request.args.get('time')
    
    search_query = Room.query
    rooms = search_query.all()
    available_rooms = [{'roomID': room.roomID, 'roomName': room.roomName, 'capacity': room.capacity, 'tags': room.tags.split(',')} for room in rooms]
    if time:
        available_rooms = []
        search_query = db.session.query(Room).join(RoomBookingDetails, Room.roomID == RoomBookingDetails.roomID, isouter=True)
        rooms = search_query.all()
        for room in rooms:
            bookings = RoomBookingDetails.query.filter_by(roomID=room.roomID).all()
            is_available = True
            for booking in bookings:
                booked_start = booking.startTime.replace(':', '')
                #time 
                if time.replace(':', '').isnumeric():
                    if time.replace(':', '') in booked_start.replace(':', ''):
                        is_available = False
                        break
            if is_available:
                available_rooms.append({
                    'roomID': room.roomID,
                    'roomName': room.roomName,
                    'capacity': room.capacity,
                    'tags': room.tags.split(','),
                })
    if capacity:
        if len(available_rooms)>0:
            available_rooms=[{'roomID': available_room["roomID"], 'roomName': available_room["roomName"], 'capacity': available_room["capacity"], 'tags': available_room["tags"]} for available_room in available_rooms if int(capacity)<=int(available_room["capacity"])]
    if query:
        if len(available_rooms)>0:
            available_rooms=[{'roomID': available_room["roomID"], 'roomName': available_room["roomName"], 'capacity': available_room["capacity"], 'tags': available_room["tags"]} for available_room in available_rooms if query in available_room["roomName"]]
    if tags:
        if len(available_rooms)>0:
            print("tags"," ".join(available_rooms[0]["tags"]))
            available_rooms=[{'roomID': available_room["roomID"], 'roomName': available_room["roomName"], 'capacity': available_room["capacity"], 'tags': available_room["tags"]} for available_room in available_rooms if tags in " ".join(available_room["tags"])]

    return jsonify({'rooms': available_rooms})

@main.route('/book', methods=['POST'])
@authenticate
def book():
    data = request.json
    roomID = data['roomID']
    accessToken = request.headers.get('Authorization')
    startTime = data['startTime']
    endTime = data['endTime']
    date = data['date']
    
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

    socketio.emit('room_booked', {'roomID': roomID, 'date': date, 'startTime': startTime, 'endTime':endTime})

    return jsonify({'success': True, 'message': 'Room booked successfully'})


@main.route('/room/<int:id>', methods=['GET'])
@authenticate
def room_details(id):
    room = Room.query.get_or_404(id)
    bookings = RoomBookingDetails.query.filter_by(roomID=id).all()
    accessToken = request.headers.get('Authorization')
    
    booking_list = [
        {'date': booking.date, 'startTime': booking.startTime, 'endTime': booking.endTime, 'accessToken': booking.accessToken} if booking.accessToken == accessToken
        else {'date': booking.date, 'startTime': booking.startTime, 'endTime': booking.endTime}
        for booking in bookings
    ]

    room_details = {
        'roomID': room.roomID,
        'roomName': room.roomName,
        'capacity': room.capacity,
        'tags': room.tags.split(','),
        'bookings': booking_list
    }
    return jsonify(room_details)

@main.route('/rooms', methods=['GET'])
@authenticate
def get_all_rooms():
    rooms = Room.query.all()
    room_list = [{
        'roomID': room.roomID,
        'roomName': room.roomName,
        'capacity': room.capacity,
        'tags': room.tags.split(','),
    } for room in rooms]
    
    return jsonify({'rooms': room_list})

@main.route('/user_bookings', methods=['GET'])
@authenticate
def get_user_bookings():
    access_token = request.headers.get('Authorization')
    bookings = db.session.query(
        Room.roomID,
        Room.roomName,
        Room.capacity,
        Room.tags,
    ).join(RoomBookingDetails, Room.roomID == RoomBookingDetails.roomID).distinct(Room.roomID).filter(RoomBookingDetails.accessToken == access_token).all()

    booking_list = [{
        'roomID': booking.roomID,
        'roomName': booking.roomName,
        'capacity': booking.capacity,
        'tags': booking.tags.split(','),
    } for booking in bookings]
    return jsonify(booking_list)


@main.route('/populate-rooms', methods=['POST'])
@authenticate
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