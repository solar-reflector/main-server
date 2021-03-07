var config = {
    type: 'line',
    data: {
        datasets: [{
            data: [],
            backgroundColor: 'rgba(24,84,100, 0.1)',
            borderColor: '#185464',
            fill: true,
            lineTension: 0.15
        }]
    },
    options: {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }],
            yAxes: [{
                ticks: {
                    suggestedMin: 300,
                    suggestedMax: 440
                }
            }]
        },
        animation: {
            duration: 0
        }
    }
}
const db = firebase.firestore();
window.onload = function () {
    var ctx = document.getElementById('canvas')
    window.myLine = new Chart(ctx, config)

    db.collection("data").orderBy("date", "desc").limit(20)
        .onSnapshot(function (querySnapshot) {
            var data = []
            querySnapshot.forEach(doc => {
                data.push({
                    x: doc.data().date.toDate(),
                    y: doc.data().value
                })
            })
            config.data.datasets[0].data = data
            window.myLine.update()
        })
}
