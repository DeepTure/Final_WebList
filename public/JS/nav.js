/* Antiguo nav
<body onresize="showMenu('bodyCall')">

	<nav>
		<article>
			<img src="IMG/WebListLogo.png" class="navImg">
			<p class="titleFont addLeftMargin alignMiddle">
				WebList Project
			</p>
		</article>
		
		<article class="navLinks">
			<a class="bodyFont" href="recovery.html" >
				Recuperar acceso
			</a>
			<a class="bodyFont addRightMargin addLeftMargin" href="help.html">
				Ayuda
			</a>
		</article>
		
		<article class="addRightMargin hideNavIcon addFadeInAnimation">
			<img class="navImgMini" src="IMG/more.png" onclick="showMenu()">
		</article>
	</nav>
	<section class="extraLinks addFadeInAnimation" id="links">
		<a class="bodyFont addFadeInAnimation grayHighlight mobileLinks alignMiddle centerText" href="recovery.html" >
			Recuperar acceso
		</a>
		<a class="bodyFont addFadeInAnimation grayHighlight mobileLinks alignMiddle centerText" href="help.html">
			Ayuda
		</a>
	</section>

function showMenu(whereIsCalled) {
	if (window.innerWidth <= 600){
		if (document.getElementById("links").style.display === "block" && whereIsCalled !== 'bodyCall') {
			document.getElementById("links").style.display = "none";
		}
		else{
			if (whereIsCalled !== 'bodyCall') {
				document.getElementById("links").style.display = "block";
			}
		}
	}
	else{
		document.getElementById("links").style.display = "none";
	}
}
*/

const header = document.getElementById('header');
const toggle = document.getElementById('toggle');
const navbar = document.getElementById('navbar');
//Opcional
document.onclick=function(e){
    if(e.target.id !== 'header' && e.target.id !== 'toggle' && e.target.id !== 'navbar'){
        toggle.classList.remove('active');
        navbar.classList.remove('active');
    }
}

toggle.onclick = function(){
    toggle.classList.toggle('active');
    navbar.classList.toggle('active');
}