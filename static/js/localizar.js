// var tabelaPrateleira = document.getElementById('tabelaPrateleira');
// var btnAdicionar = document.getElementById('btn-Adicionar');
// var botoesPrateleira = document.querySelectorAll('.caixa-botao');
var tables = document.querySelectorAll('.table-container');
var divMain = document.getElementById("main-fileiras"); 

var inputProduto = document.getElementById("inputProduto");
var inputLote = document.getElementById("inputLote");
var inputValidade = document.getElementById("inputValidade");
var epc
var retirados


window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    socket.emit('desativar','');

  });  

const socket = io('ws://192.168.43.219:5000', {closeBeforeUnload: false,});


socket.on('connect', () => {
  console.log('Conectado ao servidor Flask via WebSocket');
  socket.emit('ativar', 'ligar')

});


window.onload = function() {
        request_data_inventory()

    objetoString = sessionStorage.getItem("objetoToReceive");
    objetoRecebido = JSON.parse(objetoString);
    
    
}



function criarTabela(dados_inventory) {

        tables = document.querySelectorAll('.table-container');

        let tabelaHTML = '<table class="table table-bordered table-hover " id = "listar-dados">';
        tabelaHTML += '<thead><tr><th>ID</th><th>Produto</th><th>Lote</th><th>Validade</th><th>Entrada</th><th>Localizar</th><th>Retirar</th></tr></thead>';
        tabelaHTML += '<tbody>';
        currentDate = new Date()
        dados_inventory.forEach(item => {
            
            if(item.status == 'Pendente'){
                fillButton = `<td><button type="button" class="btn btn-primary" onclick="executarFuncao(this,'${item.epc}') ">
                Validar
                </button></td>`
            }
            else{
                fillButton= `<td><center><button  class="btn btn-outline-success" type="button"
                onclick="solicitarRetirada(this,'${item.epc}')">Solicitar Retirada</button><center></td>`
            }
            
            tabelaHTML += `<tr id = ${item.epc} ><td>${item.epc}</td>
                                <td>${item.produto}</td>
                                <td>${item.lote}</td>
                                <td>${item.validade}</td>
                                <td>${item.data}</td>
                                <td><center><button  class="loc-button btn btn-outline-success" type="button"
                                onclick="localizar(this,'${item.epc}')"><span class="icon">
                                <ion-icon name="search-outline"></ion-icon>
                            </span></button><center></td>
                            ${fillButton}
                                </tr>`;
        });
        tabelaHTML += '</tbody></table>';
        
        tables.forEach(tabela => {
                tabela.innerHTML = tabelaHTML;
        });

        $(document).ready(function() {
            var dataTable = $('#listar-dados').DataTable({
                "language": {
                    "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json"
                },

                
            });
            dataTable.on('init.dt', function() {
                // A tabela foi inicializada, agora podemos acessar o elemento de pesquisa
                searchBar = document.querySelector('input[type="search"]');

                if (sessionStorage['objetoToReceive'] != undefined){

                    dataTable.search(objetoRecebido[0].epc).draw();
                    sessionStorage.clear();
                    $(".btn-warning").click()

                }
                
              });
        });
    }


var flag_found
function localizar(button,epcToSearch){

        spins = document.querySelectorAll('.loc-button')

        spins.forEach(function(elemento) {
            elemento.innerHTML='<span class="icon"><ion-icon name="search-outline"></ion-icon></span>'
        })

        button.innerHTML='<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
        

        var elementos = document.querySelectorAll('*');

        // Itera sobre cada elemento
        elementos.forEach(function(elemento) {
        // Verifica se o elemento tem o estilo específico
        if (getComputedStyle(elemento).color === 'rgb(255, 255, 255)') {
            // Remove o estilo
            elemento.style.removeProperty('color');
            elemento.style.removeProperty('background-color');
        }
        });

        epc_line = document.getElementById(epcToSearch)

        epc_line.style.backgroundColor= "#333"
        epc_line.style.color = 'var(--white)'
        epc = epcToSearch

        document.getElementById('bloco').innerHTML ='Bloco: <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
        document.getElementById('estante').innerHTML ='Estante: <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'

        var hoveredElements = document.querySelectorAll(".hovered");

        if (hoveredElements.length >0){
            for (element of hoveredElements){

                element.classList.remove('hovered')
            }

        }

}





var not_found = 1

dados = {}
dados_verificar = {}
flag_found = false
var recived_data

socket.on('localizar', (mensagem) => {
    recived_data = mensagem
    console.log('Mensagem recebida:' + mensagem);

    document.getElementById('bloco').innerHTML ='Bloco: <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
    document.getElementById('estante').innerHTML ='Estante: <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'

    var hoveredElements = document.querySelectorAll(".hovered");

    if (hoveredElements.length >0){
        for (element of hoveredElements){

            element.classList.remove('hovered')
        }

    }

    if(dados[recived_data.bloco] == undefined){
        dados[recived_data.bloco] = {}

    }

    if (dados[recived_data.bloco][recived_data.linha + recived_data.coluna] == undefined){
        dados[recived_data.bloco][recived_data.linha + recived_data.coluna] = []
        dados_verificar[recived_data.linha + recived_data.coluna] = []
    }

    list_dados = []

    indexValues = Object.keys(recived_data).filter(key=> Number(key).toString() != 'NaN' )
    for (key in indexValues) {
        
        
        list_dados.push(recived_data[key])

    }
    dados[recived_data.bloco][recived_data.linha + recived_data.coluna] = list_dados
    dados_verificar[recived_data.linha + recived_data.coluna] = list_dados

    
    breakLoop = false
    for(bloco in dados){
        for (key in dados[bloco]){ 
            if(dados[bloco][key].includes(epc)){

                var hoveredElements = document.querySelectorAll(".hovered");

                if (hoveredElements.length >0){
                    for (element of hoveredElements){
            
                        element.classList.remove('hovered')
                    }
            
                }
                prateleira = document.getElementById(key)

                
                prateleira.classList.add("hovered");

                bloco_estoque = document.getElementById(bloco)
                bloco_estoque.classList.add("hovered");

                document.getElementById('bloco').innerText ="Bloco: " + bloco
                document.getElementById('estante').innerText ="Estante: " + key
                
                
                breakLoop = true 
                
                
                break

            }
            if (breakLoop == true){
                break
            }
        }
    }
    teste_lista=[]

    //Não lidos pelos sensores
    for (list_verificados of Object.values(dados_verificar)){
        teste_lista = teste_lista.concat(list_verificados)

    }
    retirados = epcsEstoque.filter(value => !teste_lista.includes(value))
})
    


var object_response
var epcsEstoque = []

var dados_inventory = []
    
function request_data_inventory(){

$.ajax({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    type: "GET",
    url: "/API-GET-POST/Inventory",
    success: function (response) {
        object_response = response
        
        for (object of response) {
            epcsEstoque.push(object.epc)
            dados_inventory.push(object)
        }

        itens_estoque = dados_inventory.filter(item=> item.status != 'Saida')
        criarTabela(itens_estoque);

        retiradas_pendentes = dados_inventory.filter(item=> item.status == 'Pendente')
        document.getElementById('infoMessage').innerText =  retiradas_pendentes.length

        
    }, 
    error: function () {
    alert("Não foi possivel encontrar o item!")
    }
})

}

function retirada(epcToModify, button, status){
    

    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "POST",
        url: "/API-GET-POST/Inventory",
        data: JSON.stringify({'epc':epcToModify, 'status':status}),

        success: function (response) {

            if (status == 'Pendente'){

                button.classList.remove("btn-outline-success")
                button.classList.add("btn-primary")
                
                button.innerText = 'Validar'
                button.onclick = function() { executarFuncao(this,epcToModify)}
                alert("Pedido de retirada concluido!")
            }
            else{
                button.classList.remove('btn-primary')
                button.classList.add('btn-success')
                alert("Item Retirado do estoque!")
                var linha = button.closest('tr');
                linha.parentNode.removeChild(linha);
            }
        }, 
        error: function () {
        alert("Não foi possivel realizar o pedido!")
        }
    })

}


function executarFuncao(button,epcToModify) {
    
    

    if (retirados != undefined){

        var linha = button.closest('tr')
        var outroBotao = linha.querySelector('button:last-of-type');
        outroBotao.click();

        if (retirados.includes(epcToModify)){
            retirada(epcToModify,button,'Saida')
        }
        else{
            alert('O item se encontra na prateleira!')
        }
    }
    else{
        alert('Não há conexão!')
    }
}

  function solicitarRetirada(button,epcToModify) {


    retirada(epcToModify,button,'Pendente')

    }

    function toggleTabela(id) {
        var tabela = document.getElementById(id);
        
        // Verifica se a tabela está visível
        if (getComputedStyle(tabela).display === 'none') {
          // Se estiver oculta, mostra a tabela
          tabela.style.display = 'table';
        } else {
          // Se estiver visível, oculta a tabela
          tabela.style.display = 'none';
        }
      }