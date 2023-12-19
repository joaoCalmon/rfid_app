var tabela = document.getElementById("myTable");



function criarTabela(dados) {
        
    let tabelaHTML = '<table class="table table-bordered table-hover " id = "listar-dados">';
    tabelaHTML += '<thead><tr><th>Produto</th><th>Quantidade Max</th><th>Lim Min(%)</th></tr></thead>';
    tabelaHTML += '<tbody>';

    dados.forEach(item => {

        tabelaHTML += `<tr> 
                            <td style="text-align: center;">${item.produto}</td>
                            <td style="text-align: center;">${item.qnt_max}</td>
                            <td style="text-align: center;">${item.limite_min}</td>
                        </tr>`;
    });
    tabelaHTML += '</tbody></table>';
    
    tabela.innerHTML = tabelaHTML;

    $(document).ready(function() {
        $('#myTable').DataTable({
            

            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json"
            },
            "initComplete": function () {
                $('#myTable').Tabledit({

                    // ajax:{
                        url:"/API-GET-POST/stockLimits",
                        dataType:'json',
                        type:'POST',
                    // },
                    
                    columns: {
                        identifier: [0,'produto'],
                        editable: [[1,'qnt_max'], [2,'limite_min']]
                    },
                    restoreButton:true,
                    onSuccess:function(data, textStatus, jqXHR){

                        alert(data.message)
                        $('#' + data.id).remove();
                }
                    
                });
            }
        });
    });
    
}


function request_data(){
    

    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/stockLimits",
        success: function (response) {
            objetoRecebido = response
            
            criarTabela(objetoRecebido)
        },  
        error: function () {
          alert("Não foi possivel encontrar!")
        }
      })

    }


window.onload = function() {
    request_data()

}

