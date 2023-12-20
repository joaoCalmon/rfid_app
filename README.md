# Controle de Estoque Hospitalar RFID

Este projeto visa implementar um sistema avançado de controle de estoque utilizando tecnologia RFID (Radio-Frequency Identification). A solução proporciona um rastreamento em tempo real dos produtos, assegurando um controle preciso das quantidades, validades e emitindo alertas estratégicos para reabastecimento.

## Principais Funcionalidades

1. **Leitura RFID em Tempo Real:** Sensores RFID localizados nas prateleiras garantem leituras precisas dos produtos, oferecendo uma visão em tempo real do estoque.

2. **Controle de Validade:** O sistema monitora as datas de validade dos produtos, alertando automaticamente quando um item está próximo do vencimento.

3. **Níveis de Estoque:** Alertas automáticos são gerados quando os níveis de estoque atingem um patamar crítico, indicando a necessidade de reabastecimento.

4. **Solicitação de Retirada:** Usuários podem solicitar a retirada de produtos do estoque através da interface web, iniciando um processo automatizado.

5. **Integração com Banco de Dados:** As informações relevantes são armazenadas em um banco de dados, assegurando a persistência e histórico dos dados.

6. **Conexão WebSocket:** A comunicação em tempo real é realizada através de WebSocket, permitindo atualizações instantâneas na interface do usuário.

## Componentes do Projeto

1. **Página Web:** Uma interface intuitiva que possibilita a visualização do estoque, realização de solicitações de retirada e recebimento de alertas.

2. **Servidor Flask:** Responsável pela lógica de negócios, interação com o banco de dados e comunicação com os sensores RFID.

3. **Sensores RFID:** Dispositivos estrategicamente posicionados nas prateleiras realizam leituras RFID para identificar e rastrear os produtos.

4. **Banco de Dados:** Armazena informações cruciais sobre produtos, movimentações no estoque, validades e outros dados relevantes.

## Configuração do Ambiente

Assegure-se de ter os seguintes componentes instalados:

- Python 3.x
- Flask (framework para desenvolvimento web)
- Socket.IO (para comunicação WebSocket)
- Banco de dados (SQLite ou outro de sua escolha)
- Sensores RFID e hardware compatível

## Instalação e Execução

1. Clone o repositório para o seu ambiente local:
   
       git clone https://github.com/seu-usuario/controle-estoque-rfid.git
       cd controle-estoque-rfid

2. Instale as dependências necessárias:

       pip install -r requirements.txt
   
3. Inicie o servidor Flask:

       python app.py

