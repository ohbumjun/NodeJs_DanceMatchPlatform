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
        card.querySelector('#card-place-time').innerHTML=e['time']+' '+e['place'] //시간 장소
        card.querySelector('#card-people').innerHTML=e['current_people']+'명'+'/'+e['people']+'명'//인원

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
    clone.querySelector('.modal-header-text').innerHTML=data[idx]['title']
    clone.id = 'modal'+ e.id





    //video upload 했을 때는??
    let iframe = document.createElement('iframe');
    iframe.src =data[idx]['video']

    clone.querySelector('.modal-video-container').appendChild(iframe)


    clone.querySelector('.main-content').innerHTML=data[idx]['contents']
    clone.querySelector('.modal-author').innerHTML='글쓴이: '+data[idx]['author']
    clone.querySelector('.modal-place').innerHTML='장소: '+data[idx]['place']
    clone.querySelector('.modal-time').innerHTML='시간: '+data[idx]['time']
    clone.querySelector('.modal-people').innerHTML='인원: '+data[idx]['people']



    //comment 저장할 때 boardid 필요함
    let boardid =data[idx]['_id']
    let board_id = clone.querySelector("#boardid")
    board_id.value = boardid

    //comment 창 불러오기
    let commentcontainer = clone.querySelector('.modal-comment')
    data[idx]['comments'].map(function(e){draw_comment(e,commentcontainer,boardid)})
    

    //신규 코멘트 처리
    //리팩토링해야됨
    let comment_submit_btn = clone.querySelector('.comment-submit-btn')
    comment_submit_btn.addEventListener("click",function(e)
    {
        ajax_comment(e,clone,commentcontainer)
    }
    )

    modalbg.appendChild(clone)
    //모달창 껐다 켜지기
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

//modal에 댓글 입력할 때 비동기 업데이트
function ajax_comment(e,clone,commentcontainer)
{
    e.preventDefault();

    let url = '/api/users/comment'
    let comment = clone.querySelector('textarea').value
    let boardid =clone.querySelector('#boardid').value
    let data = {comment:comment,boardid:boardid}

    data = JSON.stringify(data)
    var xhr = new XMLHttpRequest()
    xhr.open('POST',url);
    xhr.setRequestHeader('Content-Type','application/json')
    xhr.send(data)
    xhr.addEventListener('load',function(){
        var result = JSON.parse(xhr.responseText);
        commentcontainer.innerHTML=''
        //result:{result:{comments:Array}}
        result.result.comments.map(function(e){draw_comment(e,commentcontainer,boardid)})
    })
}

function remove_comment(e,comment_id,boardid,commentcontainer)
{

    let commentid= comment_id
    let data = {commentid:commentid,boardid:boardid}
    let url = '/api/users/delete_comment'
    data = JSON.stringify(data)

    var xhr = new XMLHttpRequest()
    xhr.open('POST',url);
    xhr.setRequestHeader('Content-Type','application/json')
    xhr.send(data)
    xhr.addEventListener('load',function(){
        var result = JSON.parse(xhr.responseText);
        let delete_comment = document.body.querySelector(`#comment${commentid}`).parentNode
        delete_comment.remove()
        // commentcontainer.innerHTML=''
        // //result:{result:{comments:Array}}
        // result.result.comments.map(function(e){draw_comment(e,commentcontainer,boardid)})
    })
}

function change_comment(e,comment,comment_contianer,comment_id,boardid,commentcontainer)
{
    //commentcontainer : total comment container comment_container : single comment container
    let original_comment = comment.innerHTML;
    comment.innerHTML=''
    let UpdateComment = document.createElement("textarea")
    UpdateComment.value = original_comment
    comment.appendChild(UpdateComment)

    let buttons = comment_contianer.querySelectorAll('button')
    buttons.forEach((e)=>{e.style.display="none"})

    let update_button = document.createElement('button')
    update_button.innerHTML='완료'
    let cancel_button = document.createElement('button')
    cancel_button.innerHTML='취소'

    cancel_button.addEventListener('click',function(e)
    {
        comment.innerHTML=original_comment
        update_button.remove()
        cancel_button.remove()
        buttons.forEach((e)=>{e.style.display="inline-block"})


    })
    update_button.addEventListener('click',function(e)
    {
        let commentid= comment_id
        let content = UpdateComment.value
        let data = {commentid:commentid,boardid:boardid,content:content}
        let url = '/api/users/update_comment'
        data = JSON.stringify(data)
    
        var xhr = new XMLHttpRequest()
        xhr.open('POST',url);
        xhr.setRequestHeader('Content-Type','application/json')
        xhr.send(data)
        xhr.addEventListener('load',function(){
            var result = JSON.parse(xhr.responseText);
            comment.innerHTML=content
            update_button.remove()
            cancel_button.remove()
            buttons.forEach((e)=>{e.style.display="inline-block"})
        })
        
    })

    comment_contianer.appendChild(update_button)
    comment_contianer.appendChild(cancel_button)
}

function draw_comment(comment_data,commentcontainer,boardid)
{
    let single_comment_container = document.createElement('div')
    single_comment_container.classList.add('single-comment')
    let single_comment =  document.createElement('div')
    let comment_author =  document.createElement('div')

    single_comment.classList.add('content')
    single_comment.id = 'comment'+comment_data['_id']
    let update_comment = document.createElement('button')
    let delete_comment = document.createElement('button')
    let comment_id = comment_data['_id']

    comment_author.innerHTML=comment_data['author']+': '
    single_comment.innerHTML=comment_data['contents']
    single_comment_container.appendChild(comment_author)
    single_comment_container.appendChild(single_comment)

    user = document.body.querySelector('#user').innerHTML
  
        if(user===comment_data.author)
        {
              
        single_comment_container.appendChild(delete_comment)
        single_comment_container.appendChild(update_comment)
        delete_comment.innerHTML="삭제"
        update_comment.innerHTML="수정"
        
        delete_comment.addEventListener('click',
        function(e)
        {
         remove_comment(e,comment_id,boardid,commentcontainer)
        })
        
        
        update_comment.addEventListener('click',
        function(e)
        {
            change_comment(e,single_comment,single_comment_container,comment_id,boardid,commentcontainer)
        })
        }
        commentcontainer.appendChild(single_comment_container)  
}