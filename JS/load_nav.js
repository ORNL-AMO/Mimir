var fs = require('fs')

//open nav.html and put its contents into the navMenu div
fs.readFile("HTML/nav.html", 'utf-8', (err, data) => {
        if(err){
            alert("Unable to load nav bar :" + err.message);
            return;
        }

        document.getElementById('navMenu').innerHTML = data

				$('.navbar-toggler').click(function ( ) {

					$('.sidebar').toggleClass('collapse');

				});
      });


