
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

// 3. (video)image preview
const inpFile = document.getElementById("inpFile");

const previewContainer = document.getElementById("image-preview");

const previewImage = previewContainer.querySelector(".image-preview__image")

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
            //  result는 data url을 가질 것이다 
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
