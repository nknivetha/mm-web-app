import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';

const username = new MDCTextField(document.querySelector('.mynamec'));
const password = new MDCTextField(document.querySelector('.mypassc'));
new MDCRipple(document.querySelector('.add-user'));