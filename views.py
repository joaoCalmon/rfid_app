import os 
import sys
import pdb

from server import app, db, socketio
from models import RegistrationForm, LoginForm,User, Inventory, Orders,StockLimits
from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import login_user, login_required, logout_user
from flask import render_template, request, redirect, url_for, jsonify


path_server = os.path.dirname(__file__)  
path_libs = os.path.join(path_server,"libs/")



@app.route('/login', methods=['GET', 'POST'])
def login():
  form = LoginForm()
  # flag=1 -> Usuário não encontrado | flag=2 -> Senha errada
  flag = 0
  if form.validate_on_submit():
    user = User.query.filter_by(username=form.username.data).first()
    if user:
      if check_password_hash(user.password, form.password.data):
        login_user(user, remember=form.remember.data)
        return redirect(url_for('home'))
      else:
        flag = 1
    else:
      flag = 2
  return render_template('login.html', form=form, flag=flag)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
  form = RegistrationForm()
  if form.validate_on_submit():
    user = User.query.filter_by(username=form.username.data).first()
    if user:
      flag =1 
    else:
      flag = 2
      hashed_password = generate_password_hash(form.password.data, method='sha256')
      new_user = User(username=form.username.data, email=form.email.data, password=hashed_password)
      db.session.add(new_user)
      db.session.commit()

    return render_template('signup.html', form=form, flag=flag)

  else:
    return render_template('signup.html', form=form)

#RENDER HTML TEMPLATE
@app.route('/')
@login_required
def home():
  return render_template('dashboard.html')

@app.route('/logout')
@login_required
def logout():
  logout_user()
  return redirect(url_for('login'))

@app.route('/controle-tags')
@login_required
def controle():
  return render_template('controle_tags.html')

@app.route('/localizar')
@login_required
def localizar():
  return render_template('localizar.html')

@app.route('/ordens')
@login_required
def ordem():
  return render_template('ordens.html')

@app.route('/Limites')
@login_required
def limites_estoque():
  return render_template('limitesEstoque.html')

@app.route('/movimentacoes')
@login_required
def movimentacoes_estoque():
  return render_template('movimentacoes.html')

@app.route('/analises')
@login_required
def metricas_estoque():
  return render_template('metricas.html')

