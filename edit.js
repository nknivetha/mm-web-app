import React from "react";
import ReactDOM from "react-dom";
import MUIDataTable from "mui-datatables";
import Grow from "@material-ui/core/Grow";
import {MDCList} from '@material/list';
import {MDCTopAppBar} from '@material/top-app-bar';
import {MDCRipple} from '@material/ripple';


const list = new MDCList(document.querySelector('.mdc-list'));

const listItemRipples = list.listElements.map((listItemEl) => new MDCRipple(listItemEl));

const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);