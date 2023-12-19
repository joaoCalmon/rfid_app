var tabela = document.getElementById("myTable");

const btnId = document.getElementById("form0")
const btnProduto = document.getElementById("form1")
const btnCategoria = document.getElementById("form2")
const btnQuantidade = document.getElementById("form3")
const btnDate = document.getElementById("form4")
const date_hoje = new Date().toLocaleDateString('en-GB');

const btnlList = document.getElementById("addressList")

btnDate.value = date_hoje

var searchBar



var dados = []
function request_data(){
    

    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/Ordens",
        success: function (response) {
            console.log(response)
            for (objecetFileira of response) {
                dados.push(objecetFileira)
            }
            criarTabela(dados);
        },  
        error: function () {
          alert("Não foi possivel encontrar!")
        }
      })

    }

var objetoRecebido
window.onload = function() {


    if(sessionStorage['objetoToReceive'] != undefined){
        $('input[rel="txtTooltip"]').tooltip();
        const objetoString = sessionStorage.getItem("objetoToReceive");
        objetoRecebido = JSON.parse(objetoString);
        console.log(objetoRecebido)

        btnCategoria.value = objetoRecebido[0].cluster
        btnProduto.value = objetoRecebido[0].produto
        btnQuantidade.value = objetoRecebido[0].to_buy

        
    }

    request_data();
    request_data_itens()    
}


var object_teste
function request_data_itens(){


    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/cluster",
        success: function (response) {
            object_teste = response

            object_teste['atual'].forEach(option => {
                    const newOption = document.createElement('option');
                    newOption.value = option.produto;
                    newOption.textContent = option.produto;
                    addressList.appendChild(newOption);
            });
        },  
        error: function () {
        }
        })

    }





    function criarTabela(dados) {
        
        let tabelaHTML = '<table class="table table-bordered table-hover " id = "listar-dados">';
        tabelaHTML += '<thead><tr><th>ID Pedido</th><th>Produto</th><th>Quantidade</th><th>Categoria</th><th>Data do Pedido</th><th>Status</th><th>Associar</th></tr></thead>';
        tabelaHTML += '<tbody>';

        dados.forEach(item => {
            if(item.status == 'Em Progresso'){
                fillText = `<span class="status inProgress">${item.status}</span>`
                fillButton = `<td><center><button class="btn btn-outline-success" type="button" onclick= "redirectPage('/controle-tags',${item.id})"
                ><span class="icon">
                TAG <ion-icon name="lock-closed-outline"></ion-icon>
            </span></button><center></td>`
            dataLabel = 'data-status="inactive"'
            }
            else if(item.status == 'Recebido'){
                fillText = `<span class="status delivered">${item.status}</span>`
                fillButton = `<td><center><button class="btn btn-outline-danger" type="button"
                ><span class="icon">
                TAG <ion-icon name="lock-closed-outline"></ion-icon>
                </span></button><center></td>`

                dataLabel = 'data-status="active"'
            }

            tabelaHTML += `<tr ${dataLabel}> 
                                <td>${item.id}</td>
                                <td>${item.produto}</td>
                                <td>${item.quantidade}</td>
                                <td>${item.categoria}</td>
                                <td>${item.dataPedido}</td>
                                <td>${fillText}</td>
                                ${fillButton}
                            </tr>`;
        });
        tabelaHTML += '</tbody></table>';
        
        tabela.innerHTML = tabelaHTML;

        $(document).ready(function() {
            var dataTable = $('#myTable').DataTable({
                "language": {
                    "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json"
                },
                
            });


            dataTable.on('init.dt', function() {
                // A tabela foi inicializada, agora podemos acessar o elemento de pesquisa
                searchBar = document.querySelector('input[type="search"]');

                if (sessionStorage['objetoToReceive'] != undefined){

                    dataTable.search(objetoRecebido[0].produto).draw();
                    sessionStorage.clear();
                    $(".btn-warning").click()

                }
                
                
                // Faça o que precisar com o searchBar aqui...
              });
        
        });

        

    }

function redirectPage(url,id) {

    item = dados.filter(item=> item.id == id)

    // Converte o objeto em uma representação de string (JSON)
    objetoString = JSON.stringify(item);
    
    // Armazena o objeto na sessionStorage
    sessionStorage.setItem("objetoParaEnviar", objetoString);

    window.location.href = url;

    
}



$(document).ready(function(){
	$(".btn-group .btn").click(function(){
		var inputValue = $(this).find("input").val();
		if(inputValue != 'all'){
			var target = $('table tr[data-status="' + inputValue + '"]');
			$("table tbody tr").not(target).hide();
			target.fadeIn();
		} else {
			$("table tbody tr").fadeIn();
		}
	});
});


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



btnProduto.addEventListener("click", function () {
btnCategoria.value = ""
btnProduto.value = ""

});

btnProduto.addEventListener("change", function () {
    const selectedProduto = this.value; // Valor selecionado em btnProduto
    const objetoFill = object_teste['atual'].filter(item => item.produto === selectedProduto);

    if (objetoFill.length > 0) {
        btnCategoria.value = objetoFill[0].cluster;
    } else {
        // Lide com o caso em que o valor selecionado não corresponde a nenhum objeto
        btnCategoria.value = ""; // ou qualquer ação desejada
    }
});

