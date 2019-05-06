import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';

const username = new MDCTextField(document.querySelector('.username'));
const password = new MDCTextField(document.querySelector('.password'));
new MDCRipple(document.querySelector('.cancel'));
new MDCRipple(document.querySelector('.next'));

function signin_good(data){
	const user = data.user;

	// this function might get hit twice, first with user null
	// if (user != null && user.uid.equals('5NGsBgjCngOZmX7ANHCM9r63xfD2'))
	if (user != null && user.uid === '5NGsBgjCngOZmX7ANHCM9r63xfD2')
		// jess's UID
		window.location.href = "adminHome.html";
		
	else {
		window.location.href = "volunteerHome.html";
	 }
}

function signin_catch(error)
{
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(error.message);
}

function signin()
{
    var email = document.getElementById("email-input").value;
    var pword = document.getElementById("password-input").value;
    auth.signInWithEmailAndPassword(email, pword).catch(signin_catch).then(signin_good);
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(
      function(){return auth.signInWithEmailAndPassword(email,pword).catch(signin_catch);});
}