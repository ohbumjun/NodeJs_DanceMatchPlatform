// body라는 변수를 설정해준다 왜냐하면 우리는
// html 상에서 body에다가 배경화면을 넣을 것이기 때문이다

const body = document.querySelector("body");

const IMG_NUMBER = 8;


function paintImage(imgNumber) {
    // 이 함수안에 새로운 object 를 만든다
    const image = new Image();
    image.src = `/../cssjs/all/image/${imgNumber + 1}.jpg`;
    // + 1 을 해주는 이유는 Math.random() 함수가 0을 줄수 있기 때문이다
    // 즉, 0을 주면 1번째 , 1을 주면 2번째 그림..이런식의 진행
    image.classList.add("bgImage");
    // 우린 새로운 class name 을 가지고 있고
    // 이에 대한 구체적인 작업을 하고 싶다면
    // index.css 에 가서 .bgImage 에 대한 작업을 가하자.

    body.appendChild(image);
}

function getRandom() {

    const number = Math.floor(Math.random() * IMG_NUMBER);
    // Math.floor(Math.random()*5)
    // 내 이미지는 5개가 있다. 1 ~ 5 사이의 정수를 랜덤 리턴하기 원한다 

    return number;
}

function init() {

    const randomNumber = getRandom();
    paintImage(randomNumber);

}

init();