import os

DEBUG =True

SECRET_KEY='essaeumapalavrasupersecreta!'

basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'wx_users.db')

SQLALCHEMY_TRACK_MODIFICATIONS = True


