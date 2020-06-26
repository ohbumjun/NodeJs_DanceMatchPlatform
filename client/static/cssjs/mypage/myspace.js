
// 1. tab
function onTabClick(event) {
  event.preventDefault()
     
  let activeTabs = document.querySelectorAll('.active');
  // deactivate existing active tab and panel
  activeTabs.forEach(function(tab) {
      tab.className = tab.className.replace('active', '').replace(' ','');
  });
  // activate new tab and panel
  event.target.parentElement.className += ' active';
  document.getElementById(event.target.href.split('#')[1]).className += ' active';

  console.log("Scroll working")
  window.scrollTo(0,0); 
}
  const element = document.getElementById('nav-tab');
  element.addEventListener('click', onTabClick);

// 2. modal
const openButton = document.getElementById("open")
const modal = document.querySelector(".modal")

// X 버튼 누르면 닫히게 하기 
const overlay = modal.querySelector(".modal__overlay")
const closeBtn = modal.querySelector("button");

const openModal = () =>{
    modal.classList.remove("hidden")
}
const closeModal = () =>{
    modal.classList.add("hidden")
}

overlay.addEventListener("click",closeModal)

closeBtn.addEventListener("click",closeModal)

openButton.addEventListener("click",openModal)

// 3. image preview > ( 연습용 ) 사실상 무의미 
const inpFile = document.getElementById("inpFile");
// Video Preview 창 
const previewContainer = document.getElementById("image-preview");

// image 업로드 되면 나타나는 창 
const previewImage = previewContainer.querySelector(".image-preview__image")

// image 업로드 전에 나타나는 기본 text 
const previewDefaultText = previewContainer.querySelector(".image-preview__default-text")

inpFile.addEventListener("change", function(){
    const file = this.files[0];

    if( file ){
        // new file reader 만든다 
        // reader : object > data url 로써 file을 읽는다 
      console.log("image preview working")

        const reader = new FileReader();

        previewDefaultText.style.display = "none"
        previewImage.style.display = "block"

        // reader 로 하여금 file 을 read 하게 할 것이다 
        reader.addEventListener("load", function(){

            // load ( read ) 가 끝나면 아래 코드를 실행한다 
            // 여기에서의 this는 FileReader 에 해당한다
            //  result는 data url( from AWS ) 을 가질 것이다 
            console.log(this)
            previewImage.setAttribute("src", this.result);
        });

        // we are reading data url of the file as the image source
        reader.readAsDataURL(file)

    }else{
        // null을 함으로써 css 설정 default값을 따르도록 할 것이다 
        previewDefaultText.style.display = null;
        previewImage.style.display = null;
        previewImage.setAttribute("src","")
    }
})


// 4. image ajax server sending

const button = document.getElementById('submit-btn');

var formData = new FormData(inpFile.files[0]);

// 버튼을 누르는 순간 아래의 작업이 시작된다 
button.addEventListener('click', () => {

    console.log(inpFile.files[0])
    console.log("Do you have video?")

    // video를 입력하지 않으면 alert 띄우고  redirect
    if( inpFile.files[0] == undefined ){
        console.log("no video")
        alert("Put in your video")
        location.href = "/api/users/mySpace"
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if( this.status == 200){
            let responseObject = null;
            try{
                // server에서 온 response를 json object 형태로 바꿔준다
                responseObject = JSON.parse(xhr.responseText)
            } catch(e){
                console.error('could not parse JSON')
            }
            if(responseObject){
                handleResponse(responseObject)
            }
        }else{

        }
    }

    // api/users/mySpace 에 post 형식으로 날린다 
    xhr.open('POST', '/api/users/mySpace');

    // server will not expect to see requested body which is formatted in the form of a key value peered string
    xhr.setRequestHeader('Content-type', 'application/x-www-from-urlencoded')

    console.log("sending the info to server")

    console.log(formData)

    // actual send
    xhr.send(formData)

})

// 적절한 response가 왔을 때 대처하기 
function handleResponse(responseObject){
    if( responseObject.ok  ){
        location.href = '~.html'
    }else{
        
    }
}
