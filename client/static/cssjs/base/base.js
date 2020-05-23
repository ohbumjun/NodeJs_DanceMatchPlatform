//displaying imgs
var background = document.body.querySelector('.supreme-container')
var popup = document.body.querySelectorAll('img')
var modalbg =document.body.querySelector('.modalcontainer')
var flag =true

//modal창
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
{   
    //이미지가 꺼졌다 바로 켜지는 것 방지
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


//mobile nav bar
var navbar= document.querySelector('.nav-bar')
var mobieldropdown = document.querySelector('i')
var mobileclose = document.querySelector('.close')
var dropdown = document.querySelector('.dropdown')
mobieldropdown.addEventListener('click',function(e)
{
    dropdown.classList.toggle('hide')
    dropdown.classList.toggle('active')
})

mobileclose.addEventListener('click',function(e)
{
    dropdown.classList.toggle('hide')
    dropdown.classList.toggle('active')
})

//검색결과
function search(event)
{
    event.preventDefault();
    var data={}
    document.body.querySelectorAll('select').forEach(function(e){data[e.name]=e.value}) //genre,location
    data = JSON.stringify(data);


    var url='http://localhost:4000/ajax_send_test'
    
    var xhr=new XMLHttpRequest()
    xhr.open('POST',url);
    xhr.setRequestHeader('Content-Type','application/json')
    xhr.send(data)

    xhr.addEventListener('load',function()
    {
        var result = JSON.parse(xhr.responseText);
        if(result.result!=='ok'){return;}
        document.body.querySelector(".result").innerHTML=result.condition

    })
}

