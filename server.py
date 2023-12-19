# -- coding: utf-8 --

from flask import Flask
from flask_bootstrap import Bootstrap

from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO


app = Flask ( __name__ )


app.config.from_pyfile('config.py')

db = SQLAlchemy(app)

Bootstrap(app)

socketio = SocketIO(app,logger=True, engineio_logger=True,async_mode='eventlet', cors_allowed_origins="*", max_clients=1000)

from views import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    socketio.run(app, port=5000,debug=True)



    