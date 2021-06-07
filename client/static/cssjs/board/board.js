// mobile nav bar
const navbar = document.querySelector(".nav-bar");
const mobieldropdown = document.querySelector("#menu-bar");
const mobileclose = document.querySelector(".close");
const dropdown = document.querySelector(".dropdown");


const background = document.body.querySelector(".supreme-container");
const modalbg = document.body.querySelector(".modalcontainer");

background.addEventListener(
  "click",
  function (e) {
    flag = true;
    console.log("blocking click");
    if (e.currentTarget.classList.contains("body-blackout")) {
      const targetmodal = document.body.querySelector(".is-visible");
      targetmodal.classList.remove("is-visible");
      background.classList.remove("body-blackout");
      flag = false;
    }
  },
  true
);

mobieldropdown.addEventListener("click", function (e) {
  dropdown.classList.toggle("hide");
  dropdown.classList.toggle("active");
});

mobileclose.addEventListener("click", function (e) {
  dropdown.classList.toggle("hide");
  dropdown.classList.toggle("active");
});


let flag = true;
let domain;
let UserInfo = {
  current_user:'',
  waiting_board_ids:[],
  approved_board_ids:[]
}

const message_container = document.body.querySelector('#messages-container')

let socket;

//메세지 박스 처리
function SetupMessageBox(){
  
  const message_icon = document.body.querySelector("#message-icon");
  const mesage_icon_desktop = document.body.querySelector("#message-icon-desktop");
  const notification_box = document.body.querySelector('#messages-modal')
  
  //메세지 클릭하면 알림창 등장
  message_icon.addEventListener('click',function(){
      notification_box.classList.toggle('message-notify')
  })
  
  mesage_icon_desktop.addEventListener('click',function(){
      notification_box.classList.toggle('message-notify')
  })

}


function SetupSocket(){
  // socket
socket = io.connect(domain);

socket.on("connect", function () {
  let data = {
    //email을 고유키로 socket전송 => 이 부분 해결해야될 것 같다. 보안에 문제가 없는 고유키 필요함
    email: UserInfo.current_user.email,
    socket_id: socket.id,
  };
  socket.emit("StoreInfo", data);
});
//상대방이 소켓 보냈을 때 메세지 blinking효과
socket.on("NewMember", function (message) {
  message_icon.classList.toggle("message-arrive");
  mesage_icon_desktop.classList.toggle("message-arrive")
  console.log("message", message);
});
}



// initial loading 최근순으로 정렬
const url = "/recent_posts";
const xhr = new XMLHttpRequest();
xhr.open("POST", url);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send();
xhr.addEventListener("load", function () {
  const result = JSON.parse(xhr.responseText);

  UserInfo.current_user = result.user;
  UserInfo.waiting_board_ids = result.board_waiting.map((e)=>{return e['_id']}) //신청대기중인 모임
  UserInfo.approved_board_ids = result.board_approved.map((e)=>{return e['_id']}) //신청완료된 모임
  drawing(result.result);
  // 모달 만들기
  makemodal(result.result);
  //user 바탕으로 소켓이랑 메세지박스 정리하기 
  
  if(UserInfo.current_user)
  {

    SetupMessageBox();
    // 게시글 만들기
    DrawMessageBox(result.myposts)
  
    //소켓 설정
    domain = result.url
    SetupSocket()

  }


});

//메세지 박스 만드는 함수
function DrawMessageBox(data)
{
  let boards_with_waitings = data.filter((e)=>{return e.tmp_members.length>0})

  boards_with_waitings.forEach((e)=>{
    MakeMessageElements(e)
  })
}

function MakeMessageElements(board_data)
{
  board_data.tmp_members.forEach((user_data)=>{
    //article생성
    let container_style = {'article':'message-container','main':'msg'}
    let container = MakeContainer(container_style)
    let msgbox = container.querySelector('.msg')
  
    //승인거절버튼
    let btn_styles =  {'container':'msg-btn-container','btn0':{'style':'btn-msg-approve','text':'승인'},'btn1':{'style':'btn-msg-cancel','text':'거절'},'nums':2}
    let btn_container = MakeButton(btn_styles)

    let yes_btn = btn_container.querySelector('.btn-msg-approve')
    yes_btn.addEventListener('click',function(){Approve(user_data,board_data,container,true)})

    let no_btn = btn_container.querySelector('.btn-msg-cancel')
    no_btn.addEventListener('click',function(){Approve(user_data,board_data,container,false)})

    //article안에 들어갈 정보
    let user_info = {'component':'span','classname':'name-data'}
    let board_info = {'component':'span','classname':'board-data'}
    let msg_name = MakeMessageElement(user_data['e_name'],user_info)
    let msg_board_titile = MakeMessageElement(board_data['title'],board_info)

    msgbox.appendChild(msg_name)
    msgbox.appendChild(msg_board_titile)

    container.appendChild(btn_container)
    message_container.appendChild(container)

  })

}




function Approve(user_data,board_data,container,approve)
{
  let url = '/api/users/approve'
  let data = {'board_data':board_data,'user_data':user_data,'approve':approve}
  data = JSON.stringify(data);
  const xhr = new XMLHttpRequest();

  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
  xhr.addEventListener("load", function () {
    const result = JSON.parse(xhr.responseText);
    if (result.result) {
        //지우기
        container.remove()
    }
  });

}


function MakeMessageElement(data,styles)
{

  let element = document.createElement(styles['component'])
  element.classList.add(styles['name-data'])
  element.innerHTML = data

  return element
}

function MakeContainer(styles)
{
  let container = document.createElement('article')
  container.classList.add(styles['article'])
  let content = document.createElement('div')
  content.classList.add(styles['main'])

  container.appendChild(content)

  return container

}

//버튼 생성 //styles : {'container':'msg-btn-container','btn0':{'style':'btn-msg-approve','text':'승인'},'btn1'::{'style':'btn-msg-approve','text':'승인'},,'nums':2}
function MakeButton(styles)
{
  let button_container = document.createElement('div')
  button_container.classList.add(styles['container'])

  for(let i=0;i<styles['nums'];i++)
  {
    let btn = document.createElement('button')
    let btn_info = styles[`btn${i}`]
    btn.classList.add(btn_info['style'])
    btn.innerHTML = btn_info['text']
    button_container.appendChild(btn)
  }
  return button_container
}

function drawing(data) {
  const cards_container = document.body.querySelector("#cards-container");
  cards_container.innerHTML = "";
  data.reverse().forEach(function (e, idx) {
    // id도 복사되네?
    const card = document.body.querySelector("#card-copy").cloneNode(true);
    card.id = `card${String(idx)}`;
    card.querySelector("#card-title").innerHTML = e.title;
    card.querySelector("#card-place-time").innerHTML = `${e.time} ${e.place}`; // 시간 장소
    card.querySelector("#card-people").innerHTML =
      `${e.current_people}명` + `/${e.people}명`; // 인원
    const join_btn = card.querySelector(".join-container");
    console.log(UserInfo.current_user._id)
    console.log(e)
    //board author랑 user랑 같으면 join안됨
    if(UserInfo.current_user._id!==e.author._id)
    {
      const join_modal = MakeJoinModal(e);
      join_btn.addEventListener("click", function (event) {
        OpenJoinModal(event, join_modal);
      });
    }
    else{
      let join_text = card.querySelector('.join-text')
      join_text.innerHTML = '수정하기'
      join_btn.addEventListener("click", function (event) {
        event.stopPropagation();
        window.location.href=`/update_post/${e._id}` 
      });
    }
    //비디오추가
    const iframe = document.createElement("iframe");
    iframe.src = e.video;
    card.querySelector(".video").appendChild(iframe);
    cards_container.appendChild(card);
  });
}

function OpenJoinModal(e, modal) {
  // e.preventDefault();
  e.stopPropagation(); // bubbling
  modal.classList.add("is-visible");
  background.classList.add("body-blackout");
}


//신청 버튼 누르면 이벤트 발생
function Apply(JoinModalInfo)
{
      // xhr로 날리기
      let data = { board_id: JoinModalInfo.board._id };
      const url = "/api/users/join";
      data = JSON.stringify(data);
      const xhr = new XMLHttpRequest();
  
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(data);
      xhr.addEventListener("load", function () {
        const result = JSON.parse(xhr.responseText);
        if (result.result) {
          // if(true)
          // 서버로 자신의 정보를 전송한다.
          socket.emit("NewJoin", {
            to: "?",
            msg: "NewRequest",
            email: JoinModalInfo.board.author.email,
          });
          // socket io 날려야됨
        }
      });
      // make notification
      ApplyWaiting(JoinModalInfo,'waiting')
}

//신청=>대기 or 완료 로 변환
function ApplyWaiting(JoinModalInfo,text_option)
{
  JoinModalInfo.main_text_element.innerHTML = JoinModalInfo.texts[text_option];
  let btns = JoinModalInfo.btns
  Object.entries(btns).forEach(([k,v]) => {
    v.classList.toggle('icon-hide')
})
}

function CancelApply(JoinModalInfo)
{
  
  const url = "/api/users/cancel_apply";
  let status = JoinModalInfo.status?true:false
  let board =JoinModalInfo.board
  let data = { user_id:UserInfo.current_user._id,board_id:board._id,approved:status};

  data = JSON.stringify(data);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
  xhr.addEventListener("load", function () {
    const result = JSON.parse(xhr.responseText);
    ApplyWaiting(JoinModalInfo,'apply')

  });
}

function MakeJoinModal(board) {
  const joinmodal_container = document.body.querySelector("#join-parent").cloneNode(true);
  const boardid = board._id;
  joinmodal_container.id = `join_id-${boardid}`;
  // joinmodal_container.innerHTML=boardid

  const join_modal_text = joinmodal_container.querySelector(
    ".join-middle span"
  );
  const close_btn = joinmodal_container.querySelector(".join-close-container");
  const yes_btn = joinmodal_container.querySelector(".join-yes");
  const no_btn = joinmodal_container.querySelector(".join-no");
  let waiting_btn = joinmodal_container.querySelector(".join-waiting");
  let cancel_btn = joinmodal_container.querySelector(".join-cancel");

  let JoinModalInfo = {
    'board':board,
    'btns':{
      'waiting_btn':waiting_btn,
      'yes_btn':yes_btn,
      'no_btn':no_btn,
      'cancel_btn':cancel_btn},
    'main_text_element':join_modal_text,
    'texts':{
      'waiting':'신청대기중',
      'approved':'신청완료',
      'apply':'Do you want to Join this Dance ?'
    },
    'status':false
    }

  yes_btn.addEventListener("click", () => {
    // 신청
    Apply(JoinModalInfo)
  });

  close_btn.addEventListener("click", () => {
    closevisible(joinmodal_container);
  });

  no_btn.addEventListener("click", () => {
    closevisible(joinmodal_container);
  });

  cancel_btn.addEventListener('click',(e)=>{
  e.preventDefault();
  CancelApply(JoinModalInfo);
  
  })

  //신청대기중이라면
  if(UserInfo.waiting_board_ids.includes(board._id))
  {
    ApplyWaiting(JoinModalInfo,'waiting');
  }
  //신청완료됐다면
  else if(UserInfo.approved_board_ids.includes(board._id))
  {
    JoinModalInfo.status = true
    ApplyWaiting(JoinModalInfo,'approved');
    waiting_btn.innerHTML='신청완료'
  }

  document.body.appendChild(joinmodal_container);

  return joinmodal_container;
}

function closevisible(modal) {
  modal.classList.remove("is-visible");
  background.classList.remove("body-blackout");
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
    clone.querySelector('.modal-author').innerHTML='글쓴이: '+  data[idx]['author']['e_name']
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
        console.log('clicking main modal')
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
// modal에 댓글 입력할 때 비동기 업데이트
function ajax_comment(e, clone, commentcontainer) {
  e.preventDefault();

  const url = "/api/users/comment";
  const comment = clone.querySelector("textarea").value;
  const boardid = clone.querySelector("#boardid").value;
  let data = { comment, boardid };

  data = JSON.stringify(data);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
  xhr.addEventListener("load", function () {
    const result = JSON.parse(xhr.responseText);
    commentcontainer.innerHTML = "";
    // result:{result:{comments:Array}}
    result.result.comments.map(function (e) {
      draw_comment(e, commentcontainer, boardid);
    });
  });
}

function remove_comment(e, comment_id, boardid, commentcontainer) {
  const commentid = comment_id;
  let data = { commentid, boardid };
  const url = "/api/users/delete_comment";
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
  xhr.addEventListener("load", function () {
    const result = JSON.parse(xhr.responseText);
    const delete_comment = document.body.querySelector(`#comment${commentid}`)
      .parentNode;
    delete_comment.remove();
    // commentcontainer.innerHTML=''
    // //result:{result:{comments:Array}}
    // result.result.comments.map(function(e){draw_comment(e,commentcontainer,boardid)})
  });
}

function change_comment(
  e,
  comment,
  comment_contianer,
  comment_id,
  boardid,
  commentcontainer
) {
  // commentcontainer : total comment container comment_container : single comment container
  const original_comment = comment.innerHTML;
  comment.innerHTML = "";
  const UpdateComment = document.createElement("textarea");
  UpdateComment.value = original_comment;
  comment.appendChild(UpdateComment);

  const buttons = comment_contianer.querySelectorAll("button");
  buttons.forEach((e) => {
    e.style.display = "none";
  });

  const update_button = document.createElement("button");
  update_button.innerHTML = "완료";
  const cancel_button = document.createElement("button");
  cancel_button.innerHTML = "취소";

  cancel_button.addEventListener("click", function (e) {
    comment.innerHTML = original_comment;
    update_button.remove();
    cancel_button.remove();
    buttons.forEach((e) => {
      e.style.display = "inline-block";
    });
  });
  update_button.addEventListener("click", function (e) {
    const commentid = comment_id;
    const content = UpdateComment.value;
    let data = { commentid, boardid, content };
    const url = "/api/users/update_comment";
    data = JSON.stringify(data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.addEventListener("load", function () {
      const result = JSON.parse(xhr.responseText);
      comment.innerHTML = content;
      update_button.remove();
      cancel_button.remove();
      buttons.forEach((e) => {
        e.style.display = "inline-block";
      });
    });
  });

  const button_container = comment_contianer.querySelector("#btn-container");

  button_container.appendChild(cancel_button);
  button_container.appendChild(update_button);
}

function draw_comment(comment_data, commentcontainer, boardid) {
  const single_comment_container = document.createElement("div");
  single_comment_container.classList.add("single-comment");
  const single_comment = document.createElement("div");
  const comment_author = document.createElement("div");
  comment_author.classList.add("comment-author");

  single_comment.classList.add("content");
  single_comment.id = `comment${comment_data._id}`;
  const update_comment = document.createElement("button");
  const delete_comment = document.createElement("button");
  const button_container = document.createElement("div");
  button_container.id = "btn-container";
  const comment_id = comment_data._id;

  comment_author.innerHTML = comment_data.author.e_name;
  single_comment.innerHTML = comment_data.contents;

  single_comment_container.appendChild(comment_author);
  single_comment_container.appendChild(single_comment);
  single_comment_container.appendChild(button_container);

  const user = document.body.querySelector("#user").innerHTML;

  if (user === comment_data.author.e_name) {
    button_container.appendChild(update_comment);
    button_container.appendChild(delete_comment);
    delete_comment.innerHTML = "삭제";
    update_comment.innerHTML = "수정";

    delete_comment.addEventListener("click", function (e) {
      remove_comment(e, comment_id, boardid, commentcontainer);
    });

    update_comment.addEventListener("click", function (e) {
      change_comment(
        e,
        single_comment,
        single_comment_container,
        comment_id,
        boardid,
        commentcontainer
      );
    });
  }
  commentcontainer.appendChild(single_comment_container);
}

// 검색 관련

const searchbutton = document.body.querySelector("#search-button");
searchbutton.addEventListener("click", function (e) {
  e.preventDefault();
  search(e);
});

function search(event) {

  const icon = document.body.querySelector(".icon-hide");

  icon.classList.toggle("icon-hide");

  const option = document.body.querySelector("select").value;
  const search_text = document.body.querySelector("#search-text").value;

  const url = "/api/users/search_board";
  let data = {};
  data[option] = { $regex: search_text, $options: "i" };
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
  xhr.addEventListener("load", function () {

    icon.classList.add("icon-hide");

    const result = JSON.parse(xhr.responseText);
    // 게시글 만들기
    drawing(result.result);
    // 모달 만들기
    makemodal(result.result);

    const num_result = document.body.querySelector("#search-result");
    num_result.innerHTML = `${String(result.nums)} Results`;
  });
}
