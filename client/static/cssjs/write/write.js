let cancel_btn = document.body.querySelector('#btn-cancel')
cancel_btn.addEventListener('click',

    function(){
        console.log('herer')
        window.location.href='/api/users/board'
    }

)
