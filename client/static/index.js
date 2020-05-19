var img = document.querySelector('.bg')
var idx=1;

setInterval(function(e)
{

idx++;
if(idx>3)
{
    idx=1;
}
img.style.background=`url('image/main${idx}.jpg') no-repeat center center`
img.style.backgroundSize="cover"
    

},5000)

