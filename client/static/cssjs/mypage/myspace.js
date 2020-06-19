let main =document.body.querySelector('main')
let modalbg =document.body.querySelector('.modalcontainer')


var url='http://localhost:4000/my_posts'
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
      card.querySelector('#card-title').innerHTML=e['title']
      card.querySelector('#card-place-time').innerHTML=e['time']+' '+e['place'] //시간 장소
      card.querySelector('#card-people').innerHTML=e['current_people']+'명'+'/'+e['people']+'명'//인원
      cards_container.appendChild(card)
  })
}

function drawDelModal(data)
{
 //만들어진 카드 개수만큼 modal을 만든다
var popup = document.body.querySelectorAll('#cards-container .card-container')
popup.forEach(function(e,idx){
      //modal template clone 한 다음에 modal 정보 입력
      var clone = document.body.querySelector('#modal').cloneNode(true)    
      clone.id = 'modal'+ e.id
      let board_id = data[idx]['_id']

      modalbg.appendChild(clone)

      var update_button = e.querySelector(".btn-update");


      update_button.addEventListener('click',(e)=>{
        window.location.href=`/update_post/${board_id}`  //localhost/delete_post/id 로 간다
        })


      //삭제버튼 관련 리스터
      var delete_button = e.querySelector(".btn-delete");
      var delete_yes = clone.querySelector("#del-yes");
      var delete_no = clone.querySelector("#del-no");

      delete_button.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        clone.classList.remove('modal-hide')
        clone.classList.add('modal-active')
        main.classList.toggle('blackout')
      })

      //삭제버튼 no 누르면 modal 창
      delete_no.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        clone.classList.toggle('modal-active')
        clone.classList.toggle('modal-hide')
        main.classList.toggle('blackout')
      })


      //삭제버튼 no
      delete_yes.addEventListener('click',(e)=>{

      console.log(board_id)
      window.location.href=`/delete_post/${board_id}`  //localhost/delete_post/id 로 간다
      })
})

main.addEventListener('click',function(e)
{
    var modalActive=document.body.querySelector('.modal-active')
    if(modalActive)
    {
      modalActive.classList.toggle('modal-active')
      modalActive.classList.toggle('modal-hide')
      main.classList.toggle('blackout')
    }

})
}
