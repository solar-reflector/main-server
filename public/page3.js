var survivalSpeed = 65;
var survivalSpeedText = document.querySelector('#survivalSpeed')
function update() {
    survivalSpeedText.innerHTML = `Survival Speed: ${survivalSpeed} km/h`
}

var increase = document.querySelector('#increase')
increase.addEventListener('click', event => {
    survivalSpeed++
    update()
})

var decrease = document.querySelector('#decrease')
decrease.addEventListener('click', event => {
    survivalSpeed--
    update()
})
