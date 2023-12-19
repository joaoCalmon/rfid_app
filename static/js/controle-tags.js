
let botaoAdicionar = document.getElementById("btn-Adicionar");
let corpoTab = document.getElementById("corpoTabela");
let botaoSalvar = document.getElementById("btn-Salvar");
var arrayObjetos = []
var index = 0;
let btnSwitch_processos = document.getElementById("nav-processos")
var row = {}

var dataEntrada = moment().format("DD-MM-YYYY")



var objetoRecebido
window.onload = function() {
  const objetoString = sessionStorage.getItem("objetoParaEnviar");
  objetoRecebido = JSON.parse(objetoString);
  console.log(objetoRecebido)
}


const socket = io('ws://192.168.43.219:5000');


socket.on('connect', () => {
  console.log('Conectado ao servidor Flask via WebSocket');
  
});


var recived_data
// Receber mensagens emitidas pelo servidor
socket.on('leituraTags', (mensagem) => {

  arrayObjetos = []
  table = document.getElementById('myTable')
  table.childNodes[3].innerHTML = ""

  btnStart.innerText = 'Start'
  btnStart.classList.remove('spinner-grow')

  console.log('Mensagem recebida:' + mensagem);
  
  recived_data = mensagem
  for(tag of Object.values(recived_data)){
    
    epc = tag
    id_pedido = objetoRecebido[0].id
    produto = objetoRecebido[0].produto
    quantidade = objetoRecebido[0].quantidade
    categoria = objetoRecebido[0].categoria

    adicionaLinha(index,epc,id_pedido,produto,quantidade ,"", categoria,"", dataEntrada)
    
    index = parseInt(index) + 1;
    
    arrayObjetos.push({
      epc: epc,
      id_pedido:id_pedido,
      produto: produto,
      quantidade: quantidade,
      lote: "",
      tipo:categoria,
      validade: "",
      entrada: dataEntrada,

    })
  }

});



btnStart = document.getElementById('btn-start')
btnStart.addEventListener("click", function () {

  table = document.getElementById('myTable')
  table.childNodes[3].innerHTML = ""

  btnStart.innerText = ''
  btnStart.classList.add('spinner-grow')

  socket.emit("tags","inicio")

 
})

function cadastrarTag(elemento) {

  arrayObjetos[0].validade = corpoTab.rows[0].cells[7].innerText
  arrayObjetos[0].lote = corpoTab.rows[0].cells[5].innerText

  

  dataToSend = JSON.stringify(arrayObjetos[0]);

  $.ajax({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    type: "POST",
    url: "/API-GET-POST/cadastro-tags",
    data: dataToSend,
    success: function (response) {
      var elements = document.querySelectorAll("[data-index='"+elemento+"']")
      elements[0].style.display = 'none'
      alert(response.message);
      window.location.href = "http://192.168.43.219:5000/Limites"
      
    },
    error: function (response) {
      console.log(response)
      alert(response.responseJSON.message)
    }
  });

}


function removerDados(elemento) {

  table = document.getElementById('myTable')
  table.childNodes[3].innerHTML = ""

    
}


function adicionaLinha(index, epc,id_pedido,produto,quantidade, lote,categoria, validade, Entrada) {
  let _html = "";
  _html += `<tr data-index='${index}'>
      <th class = 'hidden d-none'>${index} </th>
        <td>${epc}</td>
        <td >${id_pedido}</td>
        <td >${produto}</td>
        <td >${quantidade}</td>
        <td contenteditable="true" >${lote}</td>
        <td >${categoria}</td>
        <td contenteditable="true">${validade}</td>
        <td>${Entrada}</td>
        <td ><button  class="btn btn-outline-success cadastrarTag" type="button"
        onclick="cadastrarTag('${index}')">Save</button></td>

        <td ><button  class="btn btn-outline-danger botaoRemover" type="button"
        onclick="removerDados('${index}')">x</button></td>
      </tr>`;
  corpoTab.innerHTML += _html;
}


