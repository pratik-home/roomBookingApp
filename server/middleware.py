from functools import wraps
from flask import request, jsonify
from models import Session 

def authenticate(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        access_token = request.headers.get('Authorization')
        if not access_token:
            return jsonify({'message': 'Token is missing!'}), 403
        
        try:
            session = Session.query.filter_by(accessToken=access_token).first()
            if not session:
                return jsonify({'message': 'Token is invalid!'}), 403
        except:
            return jsonify({'message': 'Token is invalid!'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

