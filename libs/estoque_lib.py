
import os
import sys
import pdb
import datetime
import pandas as pd
from sqlalchemy import inspect

from werkzeug.security import check_password_hash


path_libs = os.path.abspath(sys.argv[0])
path_server = os.path.dirname(path_libs)

sys.path.insert(1,path_server)

from server import db
from models import User, Inventory, Orders,StockLimits

def get_db_values(table_class,columns=''):

  inspector = inspect(table_class)
  object_colunms = [column.key for column in inspector.columns]
  
  answer = table_class.query
  
  if columns:
    answer = answer.with_entities(*(getattr(table_class, coluna) for coluna in columns))
  else:
    columns = object_colunms

  answer = answer.all()
  resultado = []
  for row  in answer:
      object = {}
      for column_name in columns:
        object[column_name] = getattr(row,column_name)
      resultado += object,
  
  return resultado 


def dash_info_values():
  resultado_metrics = get_db_values(table_class=StockLimits)
  df_settings = pd.DataFrame(resultado_metrics)

  resultado_itens = get_db_values(table_class=Inventory, 
    columns=['epc','produto','validade','cluster','quantidade','lote','status','data'])
  
  df_table_inventory = pd.DataFrame(resultado_itens) 

  df_table_inventory['quantidade'] = df_table_inventory['quantidade'].astype(int)
  df_table_validade = df_table_inventory[df_table_inventory['status'] != 'Saida']
  
  df_table_inventory[['validade', 'data']] = \
  df_table_inventory[['validade', 'data']].apply(pd.to_datetime, format='%d-%m-%Y')
  

  df_table_pendentes = df_table_inventory[df_table_inventory['status'] == 'Pendente']

  df_table_saidas = df_table_inventory[df_table_inventory['status'] == 'Saida']

  df_table_ativos = df_table_inventory[df_table_inventory['status'] != 'Saida']

  #itens perto da validade   
  validade_items = df_table_validade
  validade_items = validade_items.to_dict('records')

  #total em estoque
  qnt_total_em_estoque = df_table_ativos['quantidade'].sum()
  
  #por categoria
  qnt_por_categoria = df_table_ativos.groupby('cluster')['quantidade'].sum().to_dict()

  #MES ATUAL
  mes_atual = datetime.datetime.now().month
  ano_atual = datetime.datetime.now().year

  #total de entradas no mes atual
  total_entradas_mes = df_table_inventory[(
    df_table_inventory['data'].dt.month == mes_atual)
    & (df_table_inventory['data'].dt.year == ano_atual) ]['quantidade'].sum()

  #total de saidas no mes atual
  total_saidas_mes = df_table_saidas[(
    df_table_inventory['data'].dt.month == mes_atual) 
    & (df_table_inventory['data'].dt.year == ano_atual)]['quantidade'].sum()

  #total pedidos pendentes
  total_pedidos_pendentes = len(df_table_pendentes)

  #pedidos criticos
  df_qnt_total_produto = \
  df_table_ativos.groupby(['produto','cluster'])[['quantidade']].sum().reset_index()
  
  df_total_metrics = pd.merge(df_qnt_total_produto, df_settings, on='produto')
  
  df_total_metrics['stock_atual'] = \
    (df_total_metrics['quantidade']/df_total_metrics['qnt_max'].astype(int))*100
  
  df_total_metrics['critico'] = \
    df_total_metrics.apply(lambda x:
                            1 if float(x['limite_min']) > float(x['stock_atual'])
                            else 0, axis=1)

  pedidos_criticos = \
    df_total_metrics[df_total_metrics['critico']==1]
  
  pedidos_criticos['to_buy'] = \
    (pedidos_criticos['qnt_max'].astype(float)
    *(pedidos_criticos['limite_min'].astype(float)/100)
    ) 
  - pedidos_criticos['quantidade'].astype(float)
  
  values_pedidos_criticos = pedidos_criticos.to_dict(orient='records')


  values_to_dash = [{
                    "total_em_estoque": str(qnt_total_em_estoque),
                    "total_por_categoria": qnt_por_categoria,
                    "pedidos_criticos": values_pedidos_criticos,
                    "itens_perto_validade": validade_items,
                    "total_entradas_mes": str(total_entradas_mes),
                    "total_saidas_mes" : str(total_saidas_mes),
                    "total_pedidos_pendentes": str(total_pedidos_pendentes)
                    }]
  
  return values_to_dash


def gerar_pedido(form):
  dt_now = datetime.datetime.now().strftime("%d-%m-%Y")
  quantidade = form['quantidade']
  produto = form['produto']
  categoria = form['categoria']
  
  usuario = form['usuario']
  senha = form['senha']

  user = User.query.filter_by(username=usuario).first()
  flag = 2
  if user:
    if check_password_hash(user.password, senha):
      flag = 1

      ultimo_id = Orders.query.order_by(Orders.id.desc()).first()
      if ultimo_id:
        id_pedido = int(ultimo_id.id) + 1
      else:
        id_pedido = 1
      print('cheguei aqui')
      newOrder = Orders(id=id_pedido, 
                        produto=produto,
                        quantidade = quantidade,
                        preco = None,
                        dataPedido = dt_now,
                        categoria = categoria,
                        status = 'Em Progresso'
                        )
      
      db.session.add(newOrder)
      db.session.commit()

  return flag



def get_movimentacoes_por_mes():

  
  
  resultado_itens = get_db_values(table_class=Inventory, columns=['quantidade','status','data','dt_saida'])
  
  df_table_inventory = pd.DataFrame(resultado_itens)

  df_table_inventory['quantidade'] = df_table_inventory['quantidade'].astype(int)
  

  entradas = df_table_inventory.copy()
  entradas['status'] = 'Entrada'
  entradas['ano'] = pd.to_datetime(entradas['data'],dayfirst=True).dt.year
  entradas['mes'] = pd.to_datetime(entradas['data'],dayfirst=True).dt.month

  entradas_values = entradas.groupby(['ano','mes','status'])['quantidade'].sum().reset_index().to_dict('records')

  saidas = df_table_inventory[df_table_inventory['status']=='Saida'].copy()
  saidas['ano'] = pd.to_datetime(entradas['dt_saida'],dayfirst=True).dt.year
  saidas['mes'] = pd.to_datetime(entradas['dt_saida'],dayfirst=True).dt.month
  
  saida_values = saidas.groupby(['ano','mes','status'])['quantidade'].sum().reset_index().to_dict('records')

  movimentacoes_values = saida_values + entradas_values

  teste = entradas.groupby(['ano','mes'])[['quantidade']].sum().cumsum() - saidas.groupby(['ano','mes'])[['quantidade']].sum().cumsum()
  teste = teste.ffill()
  acumulado_mensal = teste.reset_index().to_dict('records')

  dados = {"movimentacoes":movimentacoes_values, "acumulado":acumulado_mensal}

  return dados
  
def getHistoricoEntradas():

  resultado_itens = \
    get_db_values(
      table_class=Inventory, 
      columns=['epc','produto','validade','cluster','quantidade','lote','status','data']
      )
  
  df_table_inventory = pd.DataFrame(resultado_itens) 
  df_table_inventory['quantidade'] = df_table_inventory['quantidade'].astype(int)

  df_table_inventory['ano'] = pd.to_datetime(df_table_inventory['data'],dayfirst=True).dt.year
  df_table_inventory['mes'] = pd.to_datetime(df_table_inventory['data'],dayfirst=True).dt.month

  df_table_ativos = df_table_inventory[df_table_inventory['status'] != 'Saida']

  df_cluster_grouped = df_table_ativos.groupby(['cluster','produto'])['quantidade'].sum()
  resultado_atual = df_cluster_grouped.reset_index().to_dict(orient='records')

  df_table_inventory = df_table_inventory.groupby(['ano','mes','produto'])['quantidade'].sum()
  resultado_historico = df_table_inventory.reset_index().to_dict(orient='records')

  values={}
  values['atual'] = resultado_atual
  values['historico'] = resultado_historico

  return values