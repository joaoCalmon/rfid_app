function criarTabela(dados_inventory,divTabela,id) {


    let tabelaHTML = `<table class="table table-bordered table-hover " id = ${id}>`;
    tabelaHTML += '<thead><tr><th>ID</th><th>Produto</th><th>Lote</th><th>Validade</th><th>Entrada</th></tr></thead>';
    tabelaHTML += '<tbody>';
    currentDate = new Date()
    dados_inventory.forEach(item => {

        tabelaHTML += `<tr id = ${item.epc} ><td>${item.epc}</td>
                            <td>${item.produto}</td>
                            <td>${item.lote}</td>
                            <td>${item.validade }</td>
                            <td>${item.data}</td>
                            </tr>`;
    });
    tabelaHTML += '</tbody></table>';
    
    
    divTabela.innerHTML = tabelaHTML;

    $(document).ready(function() {
        $(`#${id}`).DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json"
            },
            
        });
    });
}


var dados_inventory = []
$.ajax({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    type: "GET",
    url: "/API-GET-POST/Inventory",
    // data: dataToSend,
    success: function (response) {
        object_response = response
        for (object of response) {
            dados_inventory.push(object)
        }

        divTabela = document.getElementById("Entradas");
        id = "myTableEntradas"
        // entradas = dados_inventory.filter(item=> item.status == 'Entrada')
        criarTabela(dados_inventory,divTabela,id);

        divTabela = document.getElementById("Saidas");
        id = "myTableSaidas"
        saidas = dados_inventory.filter(item=> item.status == 'Saida')
        criarTabela(saidas,divTabela,id);
        

    }, 
    error: function () {
    alert("Não foi possivel encontrar o item!")
    }
})


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

