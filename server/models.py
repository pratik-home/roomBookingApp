from app import db

class Session(db.Model):
    sessionID = db.Column(db.Integer, primary_key=True)
    accessToken = db.Column(db.String(80), unique=True, nullable=False)

class Room(db.Model):
    roomID = db.Column(db.Integer, primary_key=True)
    roomName = db.Column(db.String(80), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    tags = db.Column(db.String(200))

class RoomBookingDetails(db.Model):
    bookingID = db.Column(db.Integer, primary_key=True)
    roomID = db.Column(db.Integer, db.ForeignKey('room.roomID'), nullable=False)
    accessToken = db.Column(db.String(80), db.ForeignKey('session.accessToken'), nullable=False)
    startTime = db.Column(db.String(5), nullable=False)
    endTime = db.Column(db.String(5), nullable=False)
    date = db.Column(db.String(10), nullable=False)

