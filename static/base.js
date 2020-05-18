//displaying imgs
var popup = document.body.querySelectorAll('img')
var background = document.body.querySelector('.supreme-container')

var modalbg =document.body.querySelector('.modalcontainer')


popup.forEach(function(e){

    //modal template clone 한 다음에 modal 정보 입력
    var clone = document.body.querySelector('#modal').cloneNode(true)
    clone.id = 'modal'+ e.id
    modalbg.appendChild(clone)

    e.addEventListener('click',function(event)
{   
   
    // event.preventDefault()
    var modaldata = e.id
    var targetmodal = document.body.querySelector('#modal'+modaldata)
    targetmodal.classList.add('is-visible')
    background.classList.add('body-blackout')

    var close = targetmodal.querySelector('.close-modal')
   
    close.addEventListener('click',function()
    {
        targetmodal.classList.remove('is-visible')
        background.classList.remove('body-blackout')
    }
    )

})

}
)

