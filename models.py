# -- coding: utf-8 --
from server import db, app

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length

from flask_login import LoginManager, UserMixin

loginManager = LoginManager()
loginManager.init_app(app)
loginManager.login_view = 'login'


class Inventory(db.Model):
	
	epc = db.Column(db.String(80), primary_key=True)
	id_pedido = db.Column(db.Integer)
	lote = db.Column(db.String(80),)
	produto = db.Column(db.String(80))
	cluster = db.Column(db.String(80),)
	validade = db.Column(db.String(80))
	data = db.Column(db.String(80))
	quantidade = db.Column(db.Integer)
	status = db.Column(db.String(80))
	dt_saida = db.Column(db.String(80))
	extend_existing=True
	
class Orders(db.Model):
	
	id = db.Column(db.Integer, primary_key=True)
	produto = db.Column(db.String(80),)
	quantidade = db.Column(db.String(80))
	categoria = db.Column(db.String(80),)
	preco = db.Column(db.String(80))
	dataPedido = db.Column(db.String(80))
	status = db.Column(db.String(80))
	extend_existing=True

class StockLimits(db.Model):
	
	produto = db.Column(db.String(80), primary_key=True)
	qnt_max = db.Column(db.String(80),)
	limite_min = db.Column(db.String(80))
	extend_existing=True
	

class User(UserMixin, db.Model):
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(15), unique=True)
	email = db.Column(db.String(50), unique=True)
	password = db.Column(db.String(80))
	extend_existing=True

@loginManager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))

class LoginForm(FlaskForm):
	username = StringField('Username', validators=[InputRequired(), Length(min=4, max=15)])
	password = PasswordField('Password', validators=[InputRequired(), Length(min=8, max=80)])
	remember = BooleanField('Remember me')

class RegistrationForm(FlaskForm):
	email = StringField('Email', validators=[InputRequired(), Email(message='Invalid email'), Length(max=50)])
	username = StringField('Username', validators=[InputRequired(), Length(min=4, max=15)])
	password = PasswordField('Password', validators=[InputRequired(), Length(min=8, max=80)])

if __name__ == '__main__':
    db.metadata.clear()
    db.create_all(extend_existing=True)
    