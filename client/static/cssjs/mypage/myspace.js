
// 1. tab -----
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

// 2. modal ------
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



// 3. image, video ajax server sending -----
const inpForm = document.getElementById('upload_form')
const inpFile = document.getElementById("inpFile");

inpForm.onsubmit = function(){

    var formData = new FormData(inpForm);
    var xhr = new XMLHttpRequest()

    // video를 입력하지 않으면 alert 띄우고  redirect
    if( inpFile.files[0] == undefined ){
        alert("Put in your video")
        return false;
    }

    xhr.open('POST',inpForm.getAttribute('action'), true)
    xhr.send(formData)

}


// 4. video------

// Image Preview 창 
const previewContainer = document.getElementById("image-preview");

// image 업로드 되면 나타나는 창 
const previewImage = previewContainer.querySelector(".image-preview__image")

// image 업로드 전에 나타나는 기본 text 
const previewDefaultText = previewContainer.querySelector(".image-preview__default-text")

// Video Preview 창
const VideoContainer = document.querySelector(".video-preview");


inpFile.addEventListener("change", function(){

    if(['video/mp4'].indexOf(inpFile.files[0].type) == -1){
            alert("Error: Only Mp4 format allowed")
            return;
        }
    
    // upload 된 구체적 data type
    const file = this.files[0];
    const fileReader = new FileReader();
    
    if( file ){


        fileReader.readAsDataURL(file)
        fileReader.onload = function(){

            var _VIDEO = document.querySelector('#video-element');
            _VIDEO.src = fileReader.result

            previewContainer.style.display = "none"
            VideoContainer.style.display = "block"

        }

        // // 2. video
        // var _CANVAS = document.querySelector('#canvas-element');
        // var _CTX = Canvas.getContext('2d')
        
        // // validate wheter MP4
        // if(['video/mp4'].indexOf(document.querySelector("#video_upload").files[0].type) == -1){
        //     alert("Error: Only Mp4 format allowed")
        //     return;
        // }

        // // object url as the video source
        // document.querySelector("#video-element source")
        //             .setAttribute('src', URL.createObjectURL(inpFile.files[0]));

        // // Load the Video and show
        // _VIDEO.load();
        // _VIDEO.style.display = "inline"  
        // _VIDEO.play();

            
              /*
            The dimensions (width / height) of the generated thumbnail will depend on the dimensions of the <canvas> element. The dimensions of the <canvas> element will in turn depend on the dimensions of the video.

            Please note that dimensions of video refers to the actual video, and not the CSS dimensions of the <video> element.

            To get the dimensions of the video, you need to wait for the video metadata to load. This can be done through the loadedmetadata event.
              */
              
        }else{
            // null을 함으로써 css 설정 default값을 따르도록 할 것이다 
            previewDefaultText.style.display = null;
            previewImage.style.display = null;
            previewImage.setAttribute("src","")
        }
    })