//mobile nav bar
var navbar= document.querySelector('.nav-bar')
var mobieldropdown = document.querySelector('i')
var mobileclose = document.querySelector('.close')
var dropdown = document.querySelector('.dropdown')


var background =document.body.querySelector('.supreme-container')
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


//initial loading 최근순으로 정렬
var url='http://localhost:4000/recent_posts'
var xhr=new XMLHttpRequest()
xhr.open('POST',url);
xhr.setRequestHeader('Content-Type','application/json')
xhr.send()
xhr.addEventListener('load',function()
{
    var result = JSON.parse(xhr.responseText);
    //게시글 만들기
    drawing(result.result);
    //모달 만들기
    makemodal(result.result);
})

function drawing(data)
{
    let cards_container = document.body.querySelector('#cards-container');
    data.reverse().forEach(function(e,idx)
    {
        //id도 복사되네?
        let card = document.body.querySelector('#card-copy').cloneNode(true)
        card.id = 'card'+String(idx)
        card.querySelector('#card-title').innerHTML=e['title']
        card.querySelector('#card-time').innerHTML=e['time']
        card.querySelector('#card-place').innerHTML=e['place']

        var iframe = document.createElement('iframe');
        iframe.src =e['video']
        card.querySelector('.video').appendChild(iframe);
        // card.querySelector('#card-writer').innerHTML=e['author']
        cards_container.appendChild(card)
    })
}

function makemodal(data)
{

modalbg.innerHTML=''
//만들어진 카드 개수만큼 modal을 만든다
var popup = document.body.querySelectorAll('#cards-container .card-container')
popup.forEach(function(e,idx){

//     //modal template clone 한 다음에 modal 정보 입력
    var clone = document.body.querySelector('#modal').cloneNode(true)
    //모달 정보 채워넣어야됨
    clone.querySelector('.modal-header-text').innerHTML=data[idx]['author']
    clone.id = 'modal'+ e.id
    modalbg.appendChild(clone)

    e.addEventListener('click',function()
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

})

}