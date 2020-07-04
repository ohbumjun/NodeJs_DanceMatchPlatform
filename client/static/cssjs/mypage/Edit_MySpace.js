/*

// 1. video preview ------

// form
const inpForm = document.getElementById('upload_form');

// uplaod input file
const inpFile = document.getElementById("inpFile");

// Image Preview 창 
const previewContainer = document.getElementById("video-preview");

// Video Preview 창 
const preVideo = previewContainer.querySelector('#video-element2') 

// Video Preview 창
const VideoContainer = document.querySelector(".video-view");

const Video = document.getElementById('#video-element1')

inpFile.addEventListener("change", function(){

    if(['video/mp4'].indexOf(inpFile.files[0].type) == -1){
            alert("Error: Only Mp4 format allowed")
            return;
        }

    // upload 된 구체적 data type
    const file = this.files[0];
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file)
    fileReader.onload = function(){

    // blob > local url 생성 
    // 새롭게 보일 video 링크를 우리가 올린 파일 링크로 설정
    Video.src = fileReader.result
    // 만약 바뀌었다면, 기존의 preview video 링크도 새로운 파일링크로 설정해버리기 ( 어차피 바뀐 거면 기존의 링크는 안쓸거니까)
    preVideo.src = fileReader.result

    previewContainer.style.display = "none"
    VideoContainer.style.display = "block"

    }

    */

// 2. submit to server

inpForm.onsubmit = function(){

    console.log(inpFile)
    console.log(inpText)

    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    // video를 입력하지 않으면 alert 띄우고  redirect
    if( inpFile.files[0] === undefined ){

        alert("Put in your video");

        return false;
    }

    xhr.open('POST',inpForm.getAttribute('action'), true);

    xhr.send(formData);
    
    event.preventDefault();

    return ;
}