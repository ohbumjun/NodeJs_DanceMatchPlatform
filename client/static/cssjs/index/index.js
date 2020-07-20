var imgnum =[1,2,3];
var teacher = Math.floor(Math.random()*imgnum.length)+1
var student = Math.floor(Math.random()*imgnum.length)+1

while(student===teacher)
{
    student = Math.floor(Math.random()*imgnum.length)+1
}

var teacherimg= document.querySelector('.img-dancer')
var studentimg= document.querySelector('.img-user')

teacherimg.style.backgroundImage=`url("image/main${teacher}.jpg")`
teacherimg.style.backgroundRepeat="no-repeat"
teacherimg.style.backgroundPosition='center center'


studentimg.style.backgroundImage=`url("image/main${teacher}.jpg")`
studentimg.style.backgroundRepeat="no-repeat"
studentimg.style.backgroundPosition='center center'


