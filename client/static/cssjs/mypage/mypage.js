/*active button class onclick*/
$('nav a').click(function(e) {
  e.preventDefault();
  $('nav a').removeClass('active');
  $(this).addClass('active');
  if(this.id === !'payment'){
    $('.payment').addClass('noshow');
  }
  else if(this.id === 'payment') {
    $('.payment').removeClass('noshow');
    $('.rightbox').children().not('.payment').addClass('noshow');
  }
  else if (this.id === 'profile') {
    $('.profile').removeClass('noshow');
     $('.rightbox').children().not('.profile').addClass('noshow');
  }
  else if(this.id === 'subscription') {
    $('.subscription').removeClass('noshow');
    $('.rightbox').children().not('.subscription').addClass('noshow');
  }
    else if(this.id === 'privacy') {
    $('.privacy').removeClass('noshow');
    $('.rightbox').children().not('.privacy').addClass('noshow');
  }
  else if(this.id === 'settings') {
    $('.settings').removeClass('noshow');
    $('.rightbox').children().not('.settings').addClass('noshow');
  }
});

var buttons = document.body.querySelectorAll("button");
buttons.forEach(function(button)
{
    button.addEventListener('click',function(e)
    {
        var changed = e.currentTarget.parentNode.children[0]
        changed.classList.toggle('changing')
        console.log('changed',changed)
      
        var value = changed.value
        var name = changed.name
        var data = {'name':name,'value':value}
        data = JSON.stringify(data);

        var url='http://localhost:4000/profile/update_user'
        
        var xhr=new XMLHttpRequest()
        xhr.open('POST',url);
        xhr.setRequestHeader('Content-Type','application/json')
        xhr.send(data)
    
        xhr.addEventListener('load',function()
        {
            var result = JSON.parse(xhr.responseText);
            
            if(result.result!=='ok'){
              console.log('currenttarget',e.currentTarget)
              return
              }
          
          //changed가 call stack에서 빠지므로 즉시실행함수
          (function (changed)
          {
          setTimeout(function()
          {
            changed.classList.toggle('changing')
          },3000)
          })(changed)

        })

        
    })
})


