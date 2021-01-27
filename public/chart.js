var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
          '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        datasets: [{
          label: 'Inverter Power Input',
          backgroundColor: 'rgb(82, 84, 227)',
          borderColor: 'rgb(82, 84, 227)',
          data: [0, 1, 3, 4, 7, 9, 12, 12.5, 11, 10, 7, 6, 4, 2, 1],
          fill: false,
        }]
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Time of Day'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Power (KW)'
          }
        }]
      }
    }
});
