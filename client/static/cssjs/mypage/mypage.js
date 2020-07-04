/*active button class onclick*/
$('nav a').click(function(e) {
  // e.preventDefault();
  $('nav a').removeClass('active');
  $(this).addClass('active');
  if(this.id === !'payment'){
    $('.payment').addClass('noshow');
  }
  else if(this.id === 'payment') {
    $('.payment').removeClass('noshow');
    $('.rightbox').children().not('.payment').addClass('noshow');
  }
  else if (this.id === 'profile') {
    $('.profile').removeClass('noshow');
     $('.rightbox').children().not('.profile').addClass('noshow');
  }
  else if(this.id === 'subscription') {
    $('.subscription').removeClass('noshow');
    $('.rightbox').children().not('.subscription').addClass('noshow');
  }
    else if(this.id === 'privacy') {
    $('.privacy').removeClass('noshow');
    $('.rightbox').children().not('.privacy').addClass('noshow');
  }
  else if(this.id === 'settings') {
    $('.settings').removeClass('noshow');
    $('.rightbox').children().not('.settings').addClass('noshow');
  }
});

var buttons = document.body.querySelectorAll(".btn");
buttons.forEach(function(button)
{
    button.addEventListener('click',function(e)
    {
        var changed = e.currentTarget.parentNode.children[0]
        changed.classList.toggle('changing')
        console.log('changed',changed)
      
        var value = changed.value
        var name = changed.name
        var data = {'name':name,'value':value}
        data = JSON.stringify(data);

        var url='/profile/update_user'
        
        var xhr=new XMLHttpRequest()
        xhr.open('POST',url);
        xhr.setRequestHeader('Content-Type','application/json')
        xhr.send(data)
    
        xhr.addEventListener('load',function()
        {
            var result = JSON.parse(xhr.responseText);
            if(result.result!=='ok'){
              console.log('currenttarget',e.currentTarget)
              return
              }
          
          //changed가 call stack에서 빠지므로 즉시실행함수
          (function (changed)
          {
          setTimeout(function()
          {
            changed.classList.toggle('changing')
          },3000)
          })(changed)

        })

        
    })
})


//user image preview
var uplbtn = document.body.querySelector("#upload-btn")
var clrbtn =document.body.querySelector("#clear-btn")
var sbmbtn =  document.body.querySelector("#submit-btn")

function handleImageUpload() 
{

    var image = document.getElementById("upload").files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
      document.getElementById("display-image").src = e.target.result;
    }
    

    reader.readAsDataURL(image);
    uplbtn.classList.toggle('btn-deactive')
    clrbtn.classList.toggle('btn-deactive')
    sbmbtn.classList.toggle('btn-deactive')
    //위에까지가 preview 해주기


} 

// undo btn
clrbtn.addEventListener('click',function(e){
  var uplbtn = document.body.querySelector("#upload-btn")
  e.currentTarget.classList.toggle('btn-deactive')
  uplbtn.classList.toggle('btn-deactive')
  sbmbtn.classList.toggle('btn-deactive')
  //원래 기본 이미지로 되돌려줘야됨
  document.getElementById("display-image").src= "https://images.unsplash.com/photo-1511715282680-fbf93a50e721?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
})

//내 게시물 가져오기
var url='/my_posts'
var xhr_2=new XMLHttpRequest()
xhr_2.open('POST',url);
xhr_2.setRequestHeader('Content-Type','application/json')
xhr_2.send()
xhr_2.addEventListener('load',function()
{
    var result = JSON.parse(xhr_2.responseText);
    //내 게시글 만들기
    mydrawing(result.result);
    drawDelModal(result.result);
})

function mydrawing(data)
{
  let cards_container = document.body.querySelector('#cards-container');
  data.reverse().forEach(function(e,idx)
  {
      //id도 복사되네?
      let card = document.body.querySelector('#card-copy').cloneNode(true)
      card.id = 'card'+String(idx)
      card.querySelector('#card-place').innerHTML='안녕'
      card.querySelector('#card-writer').innerHTML=e['author']
      card.querySelector('#card-time').innerHTML=e['board_date']

      let iframe = document.createElement('iframe');
      let video_url = e['video']
      iframe.src = video_url
      card.querySelector('.video').appendChild(iframe);
      cards_container.appendChild(card)
  })
}


var background =document.body.querySelector('body')
var modalbg =document.body.querySelector('.modalcontainer')
var flag =true

function drawDelModal(data)
{
 //만들어진 카드 개수만큼 modal을 만든다
var popup = document.body.querySelectorAll('#cards-container .card-container')
popup.forEach(function(e,idx){
      //modal template clone 한 다음에 modal 정보 입력
      var clone = document.body.querySelector('#modal').cloneNode(true)    
      clone.id = 'modal'+ e.id
      modalbg.appendChild(clone)
      var delete_button = e.querySelector(".btn-delete");
      delete_button.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        clone.classList.remove('modal-hide')
        clone.classList.add('modal-active')
        document.body.querySelector('.container').classList.toggle('blackout')
      })
})

document.body.querySelector('.container').addEventListener('click',function(e)
{
    var modalActive=document.body.querySelector('.modal-active')
    if(modalActive)
    {
      modalActive.classList.toggle('modal-active')
      modalActive.classList.toggle('modal-hide')
      document.body.querySelector('.container').classList.toggle('blackout')
    }

})
}
