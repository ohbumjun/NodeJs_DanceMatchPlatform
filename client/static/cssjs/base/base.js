//displaying imgs
var background = document.body.querySelector('.supreme-container')
var modalbg =document.body.querySelector('.modalcontainer')
var flag =true
//initial
initialmakemodal();

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

function initialmakemodal()
{

modalbg.innerHTML=''
var popup = document.body.querySelectorAll('.profile')
popup.forEach(function(e){

    //modal template clone 한 다음에 modal 정보 입력
    var clone = document.body.querySelector('#modal').cloneNode(true)

    clone.id = 'modal'+ e.id
    modalbg.appendChild(clone)

    //info 아니면 video 선택
    var infotag= clone.querySelector('.select-info')
    var videotag = clone.querySelector('.select-video')

    var infosection = clone.querySelector("#info-section")
    var videosection = clone.querySelector("#video-section")
    

    infotag.addEventListener('click',function(event){
    changesection(infotag,videotag,infosection,videosection)

})
    videotag.addEventListener('click',function(event){
        changesection(infotag,videotag,infosection,videosection)
    })


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
}  

function changesection(infotag,videotag,infosection,videosection)
{
    infotag.classList.toggle('modal-active')
    videotag.classList.toggle('modal-active')

    infosection.classList.toggle('section-active')
    infosection.classList.toggle('section-hide')

    videosection.classList.toggle('section-active')
    videosection.classList.toggle('section-hide')
}


function makemodal(data)
{

modalbg.innerHTML=''
var popup = document.body.querySelectorAll('.profile')
popup.forEach(function(e,idx){

    //modal template clone 한 다음에 modal 정보 입력
    var clone = document.body.querySelector('#modal').cloneNode(true)
    clone.querySelector('.modal-header-text').innerHTML=data[idx].name
    clone.id = 'modal'+ e.id
    modalbg.appendChild(clone)

//info video altering
    var infotag= clone.querySelector('.select-info')
    var videotag = clone.querySelector('.select-video')

    var infosection = clone.querySelector("#info-section")
    var videosection = clone.querySelector("#video-section")
    
    infotag.addEventListener('click',function(event){
    changesection(infotag,videotag,infosection,videosection)

})
    videotag.addEventListener('click',function(event){
    changesection(infotag,videotag,infosection,videosection)
    })


    var videocontainer=clone.querySelector('.container-video')
    
    data[idx]['video'].forEach(function(e){
        var video = document.createElement('iframe')
        video.src=e
        videocontainer.appendChild(video);

    })

    clone.querySelector('.dancer-genre').innerHTML=data[idx]['genre'].join(' ')
    clone.querySelector('.dancer-place').innerHTML=data[idx]['Place']
    clone.querySelector('.dancer-academy').innerHTML=data[idx]['Academy']


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
}  


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
        console.log(result)
        document.body.querySelector(".result").innerHTML=result.numdata
        drawimg(result.data);
        makemodal(result.data);

    })
}


function drawimg(data)
{
    var dancers = document.body.querySelector('.dancers')
    dancers.innerHTML=''
    console.log('data',data)
    data.forEach(function(e,idx)
    {
        var prof = document.createElement('div')
        var img = document.createElement('img')
        //img
        img.src=e.img
        prof.id ='img'+String(idx+1)
        //hover
        var hoverbox = document.createElement('div')
        hoverbox.classList.add('middle')
        var hovertext=document.createElement('div')
        hovertext.classList.add('middle-text')
        hovertext.innerHTML=`${e.name}`
        hoverbox.appendChild(hovertext)
        prof.classList.add('profile')
        prof.appendChild(img)
        prof.appendChild(hoverbox)
        dancers.appendChild(prof)
    })
}
