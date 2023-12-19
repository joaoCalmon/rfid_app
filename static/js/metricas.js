labels_meses = {1:"Jan", 2:"Fev",3:'Mar',4:'Abr',5:'Mai',6:'Jun',7:'Jul',8:'Ago',9:'Set',10:'Out',11:'Nov',12:'Dez'}

var total_cluster_number = document.querySelectorAll('.numbers')[0]
var composicao_number  = document.querySelectorAll('.numbers')[1]
var total_produtos_number = document.querySelectorAll('.numbers')[2]

var dados = []
var object
var produtos
var anos
function request_data(){
    

    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: "GET",
        url: "/API-GET-POST/cluster",
        success: function (response) {
            object = response

            createChartAnual(object)

            qnt_total_estoque = 0
            object['atual'].forEach(function(item) {
              qnt_total_estoque += item.quantidade    
              })

              createChartPie(object)
            total_cluster_number.innerText = total_cluster[btnCategoria.value]
            composicao_number.innerText = parseFloat((total_cluster[btnCategoria.value]/qnt_total_estoque)*100).toFixed(2) +"%"
            total_produtos_number.innerText = graphValues[btnCategoria.value].length

            labels[btnCategoria.value].forEach(option => {
              let newOption = document.createElement('option');
              newOption.value = option;
              newOption.textContent = option;
              document.getElementById("addressList2").appendChild(newOption);
          })
                        
        },  
        error: function () {
          alert("Não foi possivel encontrar!")
        }
      })

    }


var graphValues ={}
var labels = {}
var total_cluster={}
function createChartPie(object){
  

  for (cluster of ["Medicamento","Material","Equipamento"]){
    total_cluster[cluster] = 0
    graphValues[cluster] = []
    objetoData = object['atual'].filter(item=> item.cluster == cluster)
    total = objetoData.forEach(item => { total_cluster[cluster] += item.quantidade})
    objetoData.forEach(item => graphValues[cluster].push((item.quantidade*100/total_cluster[cluster]).toFixed(2)))

    labels[cluster] = []
    object['atual'].filter(item=> item.cluster == cluster).forEach(item => labels[cluster].push(item.produto))
  }

  data['labels'] = labels['Medicamento']
  data['datasets'] = [{
    label: 'Medicamentos',
    data: graphValues['Medicamento'],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(255, 100, 50)',
      'rgb(105, 34, 86)'
    ],
    hoverOffset: 4
  }]

  var config = {
    type: 'pie',
    data: data,
  };

    let canvasId = "Medicamento" + "Chart";
    let ctx = document.getElementById(canvasId).getContext("2d");
    ChartCategoria = new Chart(ctx, config);
}

var data = {
  labels: [],
  datasets: []
};



btnCategoria = document.getElementById('form1')
btnProduto = document.getElementById('form2')

$( ".target" ).on( "change", function() {

  total_cluster_number.innerText = total_cluster[btnCategoria.value]
  composicao_number.innerText = total_cluster[btnCategoria.value]
  total_produtos_number.innerText = graphValues[btnCategoria.value].length
  ChartCategoria.data.labels = labels[btnCategoria.value]
  ChartCategoria.data.datasets[0].label = btnCategoria.value
  ChartCategoria.data.datasets[0].data = graphValues[btnCategoria.value]
  ChartCategoria.update()

  labels[btnCategoria.value].forEach(option => {
    let newOption = document.createElement('option');
    newOption.value = option;
    newOption.textContent = option;
    document.getElementById("addressList2").appendChild(newOption);
})

})

$( ".target2" ).on( "change", function() {

  produto = btnProduto.value

  ChartDemanda.data.datasets = []
  count = 1
  for(ano in anos){

    dataSet = {
      label: ano,
      data: anos[ano][produto],
      backgroundColor: `rgba(22, 192, 192, ${count})`,
      borderColor: `rgba(22, 192, 192, ${count})`,
      borderWidth: 1
      
  }
  count -= 0.2
  ChartDemanda.data.datasets.push(dataSet)

  }
  ChartDemanda.update()

})


window.onload  = function() {

    btnProduto.value = "Amoxicilina"
    btnCategoria.value = "Medicamento"
    request_data();

}


function createDataMovimentacoes(object){

  anos = {}

  object['historico'].forEach(item=> anos[item.ano] = {})
            
    for (ano in anos){

      object['historico'].forEach(item=> {

        if (anos[item.ano][item.produto]== undefined){
          anos[item.ano][item.produto] = [0,0,0,0,0,0,0,0,0,0,0,0]
        }
        else{
          anos[item.ano][item.produto][item.mes-1] = item.quantidade
        
        }
        
      })

    }

  produto = btnProduto.value

  dataChart = {
    labels :Object.values(labels_meses),
    datasets : []
  }
  count = 1
  for(ano in anos){

    dataSet = {
      label: ano,
      data: anos[ano][produto],
      backgroundColor: `rgba(22, 192, ${count}, ${count})`,
      borderColor: `rgba(22, 192, ${count}, ${count})`,
      borderWidth: 1
      
  }
  count -= 0.2
  dataChart.datasets.push(dataSet)

  }

  return dataChart
}

var ChartDemanda
function createChartAnual(dados){

        let canvasId = "demandaChart";
        let ctx = document.getElementById(canvasId).getContext("2d");
        chartConfig.data = createDataMovimentacoes(dados)

        ChartDemanda = new Chart(ctx, chartConfig);

    }

// Configurações padrão do gráfico
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



btnCategoria.addEventListener("click", function () {
      // Lide com o caso em que o valor selecionado não corresponde a nenhum objeto
      btnCategoria.value = ""; // ou qualquer ação desejada
});

btnProduto.addEventListener("click", function () {
  // Lide com o caso em que o valor selecionado não corresponde a nenhum objeto
  btnProduto.value = ""; // ou qualquer ação desejada
});