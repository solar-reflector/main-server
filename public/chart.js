var config = {
    type: 'line',
    data: {
        datasets: [{
            data: [],
            backgroundColor: 'rgba(13, 71, 161, 0.1)',
            borderColor: 'rgba(13, 71, 161, 0.8)',
            fill: true,
            lineTension: 0.15
        }]
    },
    options: {
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }]
        }
    }
}

window.onload = function () {
    var ctx = document.getElementById('canvas')
    window.myLine = new Chart(ctx, config)

    db.collection("data").orderBy("date", "desc").limit(10)
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