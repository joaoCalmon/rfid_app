# -- coding: utf-8 --
import os
import sys

from flask import Flask
from flask_bootstrap import Bootstrap

from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO


app = Flask ( __name__ )


app.config.from_pyfile('config.py')

db = SQLAlchemy(app)

Bootstrap(app)

socketio = SocketIO(app, cors_allowed_origins="*",logger=True, engineio_logger=True,threaded = True)

from views import *

if __name__ == '__main__':
    with app.app_context():
        
        db.create_all()

    # app.run(host= '192.168.68.116',debug=True)
    # app.run(host= '192.168.15.32',debug=True)

    # socketio.run(app, host='192.168.43.219', port=5000,debug=True)

    app.run(debug=True)


    