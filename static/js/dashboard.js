cabecalho = document.querySelectorAll(".numbers")
var btnAno = document.getElementById('btnAno');
inputMonths = document.getElementById('inputMonths');

btnAno.value = moment().year()
inputMonths.value = 12


num_entradas = cabecalho[0]
num_saidas = cabecalho[1]
num_pedidos = cabecalho[2]
num_estoque_total = cabecalho[3]

labels_meses = {1:"Jan", 2:"Fev",3:'Mar',4:'Abr',5:'Mai',6:'Jun',7:'Jul',8:'Ago',9:'Set',10:'Out',11:'Nov',12:'Dez'}



var object_response
function request_data(){
    
    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/dashInfo",
        // data: dataToSend,
        success: function (response) {
            object_response = response
            
            num_entradas.innerText =object_response[0]['total_entradas_mes']
            num_saidas.innerText = object_response[0]['total_saidas_mes']
            num_pedidos.innerText = object_response[0]['total_pedidos_pendentes']
            num_estoque_total.innerText = object_response[0]['total_em_estoque']

            if(object_response[0]['pedidos_criticos'].length >0){
                columns = ['produto','limite_min','stock_atual','quantidade']
                adicionaLinha(object_response[0]['pedidos_criticos'],"automaticOrder",columns)
            }
            else{
                document.getElementById("automaticOrder").innerText = 'Nenhum resultado encontrado'
            }
            if(object_response[0]['itens_perto_validade'].length >0){
                columns = ['produto','quantidade','lote','validade','status']
                itensPertoVencimento = object_response[0]['itens_perto_validade'].filter(item=> moment().add('months', 12) > moment(item.validade, "DD-MM-YYYY"))
                adicionaLinha(itensPertoVencimento,"table-validade",columns)
            }
            else{
                document.getElementById("table-validade").innerText = 'Nenhum resultado encontrado'
            }

            

        },  
        error: function () {
          alert("Não foi possivel encontrar o item!")
        }
      })

}


var object_response_movimentacoes
function request_data_movimentacoes(){
    
    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/movimentacoesByMonth",
        // data: dataToSend,
        success: function (response) {
            object_response_movimentacoes = response
            
            dadosAtuais =object_response_movimentacoes['movimentacoes'].filter(item=> item.ano == moment().year())
            dadosAcumulado = object_response_movimentacoes['acumulado'].filter(item=> item.ano == moment().year())

            createChartDemanda(dadosAtuais)

            createChartAcumulado(dadosAcumulado)
            

        },  
        error: function () {
          alert("Não foi possivel encontrar o item!")
        }
      })

}

window.onload = function() {
    request_data();
    request_data_movimentacoes()
    
}


function createDataMovimentacoes(dados){

    entrada = [0,0,0,0,0,0,0,0,0,0,0,0]
    saida = [0,0,0,0,0,0,0,0,0,0,0,0]

    dados.forEach(function(item) {
        var mes = item.mes; 

        if (item.status === 'Entrada') {
            entrada[mes-1] = item.quantidade;
        } else if (item.status === 'Saida') {
            saida[mes-1] = item.quantidade;
        }
    });

    dataChart = {
        labels: Object.values(labels_meses),
        datasets: [{
            label: 'Entradas',
            data: entrada,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }, {
            label: 'Saídas',
            data: saida,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
        }
    return dataChart
}


function createDataAcumulado(dados){

    total = [0,0,0,0,0,0,0,0,0,0,0,0]

    dados.forEach(function(item) {
        var mes = item.mes; 

        total[mes-1] = item.quantidade;
        
    });

    
    dataChart = {
        labels: Object.values(labels_meses),
        datasets: [{
            label: 'Total',
            data: total,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
        }
    return dataChart
}


var ChartDemanda
function createChartDemanda(dados){

        let canvasId = "demandaChart";
        let ctx = document.getElementById(canvasId).getContext("2d");
        chartConfig.data = createDataMovimentacoes(dados)

        ChartDemanda = new Chart(ctx, chartConfig);

        

    }

var ChartAcumulado
function createChartAcumulado(dados){

    let canvasId = "acumuladoChart";
    let ctx = document.getElementById(canvasId).getContext("2d");
    chartConfig2.data = createDataAcumulado(dados)

    ChartAcumulado = new Chart(ctx, chartConfig2);


}

const chartConfig2= {
    type: "bar",
    data: '',
    options: {
        scales: {
            x: {
            },
        },
        
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
};
    

const chartConfig = {
    type: "bar",
    data: '',
    options: {
        scales: {
            x: {
            },
            y: {
            },
        },
        
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
};




function adicionaLinha(produtos, strTable,columns) {

    table = document.getElementById(strTable)
    tabelaHTML = '<table class="table table-bordered table-hover " id = "listar-dados">';
    tabelaHTML += '<thead><tr>'

    for (column of columns){
        if (column !=  "stock_atual") {
            if (column ==  "limite_min") {
                tabelaHTML += `<th > Limite Min</th>`;
            }
            else{
                tabelaHTML += `<th > ${column.charAt(0).toUpperCase() + column.slice(1)}</th>`;
            }
            
        }
        
        else{
            tabelaHTML += '<th>Nivel Atual</th>'
        }
    }
    tabelaHTML += '<th>Vizualizar</th></tr></thead><tbody>';
    for (objeto of produtos){
        for (column of columns){
            if (column ==  "stock_atual") {
                tabelaHTML += `<td >
                    <div class="progress progress-bar status return " role="progressbar"  aria-valuenow="${objeto[column]}" aria-valuemin="0" aria-valuemax="100">${parseFloat(objeto[column]).toFixed(2)}%</div>
                </td>`
            }
            else if (column ==  "limite_min") {
                tabelaHTML += `<td >
                    <div class="progress progress-bar " role="progressbar"  aria-valuenow="${objeto[column]}" aria-valuemin="0" aria-valuemax="100">${parseFloat(objeto[column]).toFixed(2)}%</div>
                </td>`
            }
            
            else if(column ==  "validade"){
                tabelaHTML+=`<td ><span class="text-danger">${objeto[column]}</span></td>`
            }
            else if(column ==  "status"){
                if( moment() > moment(objeto['validade'], "DD-MM-YYYY")){
                    tabelaHTML+=`<td ><span class="status return">Vencido</span></td>`
                }
                else{
                    tabelaHTML+=`<td ><span class="status pending">Vencimento proximo</span></td>`
                }
            }
            else{
                tabelaHTML += `<td ">${objeto[column]}</td>`;
            }
        }
        if(strTable == "table-validade" ){
            tabelaHTML += `<td ><button  class="btn btn-outline-danger" type="button"
        onclick="redirectPage('/localizar','${objeto['epc']}')"><ion-icon name="eye-outline"></ion-icon></button></td></tr>`;
        }
        else{
            tabelaHTML += `<td ><button  class="btn btn-outline-danger" type="button"
            onclick="redirectPage('/ordens','${objeto['produto']}')"><ion-icon name="eye-outline"></ion-icon></button></td></tr>`;
        }      
    }
    tabelaHTML += ' </tbody></table>';
    table.innerHTML = tabelaHTML;
}

function redirectPage(url,epc) {

    if(url == '/ordens'){
        item = object_response[0]['pedidos_criticos'].filter(item=> item.produto == epc)

    }
    else{
        item = object_response[0]['itens_perto_validade'].filter(item=> item.epc == epc)
    }

    objetoString = JSON.stringify(item);
    
    sessionStorage.setItem("objetoToReceive", objetoString);

    window.location.href = url;
}


function rebuildTable(){

    months = document.getElementById('inputMonths').value
    
    table_validade = document.getElementById("table-validade")
    table_validade.innerHTML = ""
    columns = ['produto','quantidade','lote','validade','status']
    itensPertoVencimento = object_response[0]['itens_perto_validade'].filter(item=> moment().add(parseInt(months),'months') > moment(item.validade, "DD-MM-YYYY"))
    adicionaLinha(itensPertoVencimento,"table-validade",columns)


}


$('#btnAno').on('change', function() {

    dadosAtuais =object_response_movimentacoes['movimentacoes'].filter(item=> item.ano == parseInt(btnAno.value))

    // ChartDemanda.data = ''
    ChartDemanda.data = createDataMovimentacoes(dadosAtuais)
    ChartDemanda.update()
    
  });

