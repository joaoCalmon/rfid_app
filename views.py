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

sys.path.insert(1,path_libs)
from estoque_lib import get_db_values, dash_info_values, gerar_pedido, get_movimentacoes_por_mes, getHistoricoEntradas


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



##ROTAS DO WEB SOCKET 

@socketio.on('connect')
def handle_connect():
    print('Conectado ao cliente via WebSocket')

@socketio.on('ativarBusca')
def handle_disconnect(msg):
    socketio.emit('ativarBusca',msg)

@socketio.on('localizar')
def handle_disconnect(msg):
    socketio.emit('localizar',msg)

@socketio.on('tags')
def handle_disconnect(msg):
    socketio.emit('tags',msg)

@socketio.on('leituraTags')
def handle_disconnect(msg):
    socketio.emit('leituraTags',msg)

@socketio.on('ativar')
def handle_disconnect(msg):
    socketio.emit('entrando',msg)

@socketio.on('desativar')
def handle_disconnect(msg):
    socketio.emit('saindo',msg)



#API ROUTES, HTTP REQUSTS
@app.route('/API-GET-POST/cadastro-tags', methods=['POST','GET'])
@login_required
def cadastrar_tags():

  if request.method == 'POST':
    cadastro = request.get_json()
    # for product in cadastros:
    epc,id_pedido,produto,quantidade,lote,categoria,dt_validade,dt_entrada = cadastro.values()

    check = Inventory.query.filter_by(epc=epc).first()
    if not check:
      # Inventory.query.filter_by(epc=epc, fileira=fileira,prateleira=prateleira).first()

      new_product = Inventory(epc=epc, 
                              id_pedido=id_pedido,
                              lote=lote,
                              produto=produto, 
                              quantidade = quantidade,
                              cluster = categoria,
                              validade = dt_validade,
                              data= dt_entrada,
                              status = 'Entrada'
                              )
      
      
      db.session.add(new_product)
      
      order = Orders.query.filter_by(id=id_pedido).first()
      order.status='Recebido'

      check = StockLimits.query.filter_by(produto=produto).first()
      
      if not check:
        new_product = StockLimits(produto=produto, qnt_max = None, limite_min=None)
        db.session.add(new_product)

      db.session.commit()

      return jsonify({'message': 'Cadastrado com sucesso!'}), 200
    else:
      return jsonify({'message': 'Esse Produto ja foi cadastrado!'}), 500
          


@app.route('/API-GET-POST/Inventory', methods=['POST','GET'])
@login_required
def localizar_tags():
    
    if request.method == 'GET':
      resultado = get_db_values(table_class=Inventory)
      if resultado:
        return jsonify(resultado)
      else:
        return jsonify({'message': '0 resultados encontrados!'}), 200
    else:
      dados = request.get_json()
      epc = dados['epc']
      status = dados['status']

      row = Inventory.query.filter_by(epc = epc).first()
      row.status = status
      db.session.commit()
      return jsonify({'message': 'sucesso!'}), 200
      


@app.route("/API-GET-POST/Ordens", methods=['POST','GET'])
@login_required
def orders():

  if request.method == 'GET':
    resultado = get_db_values(table_class=Orders)
    if resultado:
      return jsonify(resultado),200
    else:
      return jsonify({'message': 'Não há ordens de compra'}),500
  
  else:
    form = request.form
    flag = gerar_pedido(form)
    if flag == 2:
      return render_template('newOrder.html',flag=flag)
    elif flag == 1:
      return render_template('ordens.html',flag=flag)


@app.route('/API-GET-POST/cluster', methods=['POST','GET'])
@login_required
def cluster():

  values = getHistoricoEntradas()
  if values:
    return jsonify(values),200
  else:
    return jsonify({'message': '0 resultados encontrados'}),500

    


@app.route('/API-GET-POST/dashInfo', methods=['POST','GET'])
@login_required
def dash_info():

  values_to_dash = dash_info_values()
  if dash_info:
    return jsonify(values_to_dash)
  else:
    return jsonify({'message': '0 resultados encontrados'}),500



@app.route('/API-GET-POST/stockLimits', methods=['POST','GET'])
@login_required
def limits():
    if request.method == 'POST':
    
      action = request.form.get('action')
      produto = request.form.get('produto')

      row = StockLimits.query.filter_by(produto = produto).first()
      
      if action == 'delete':
        db.session.delete(row) 

      elif action == 'edit':
        qnt_max = request.form.get('qnt_max')
        limite_min = request.form.get('limite_min')

        row.qnt_max = qnt_max
        row.limite_min = limite_min
      try:
        db.session.commit()
        return {'message':'Dados alterados com sucesso!'},200
      except:
        return {'message':'Não foi possivel alterar os dados!'},500
    
    elif request.method == 'GET':
      resultado_metrics = get_db_values(table_class=StockLimits)
      if resultado_metrics:
        return jsonify(resultado_metrics)
      else:
        return jsonify({'message': '0 resultados encontrados'}),500



@app.route('/API-GET-POST/movimentacoesByMonth', methods=['POST','GET'])
@login_required
def movimentacoes_mes():

  movimentacoes_values = get_movimentacoes_por_mes()
  if movimentacoes_estoque:
    return jsonify(movimentacoes_values)
  else:
    return jsonify({'message': '0 resultados encontrados'}),500





  
