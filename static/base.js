//displaying imgs
var background = document.body.querySelector('.supreme-container')
var popup = document.body.querySelectorAll('img')
var modalbg =document.body.querySelector('.modalcontainer')
var flag =true

background.addEventListener('click',function(e)
{
    flag = true
    if(e.currentTarget.classList.contains('body-blackout'))
    {
        var targetmodal = document.body.querySelector('.is-visible')
        targetmodal.classList.remove('is-visible')
        background.classList.remove('body-blackout')
        flag = false
    }
    
},true)

popup.forEach(function(e){

    //modal template clone 한 다음에 modal 정보 입력
    var clone = document.body.querySelector('#modal').cloneNode(true)
    clone.id = 'modal'+ e.id
    modalbg.appendChild(clone)

    e.addEventListener('click',function(event)
{   //이미지가 꺼졌다 바로 켜지는 것 방지
    console.log('flag',flag)
    if(flag)
    {
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
    }
})


}
)   


