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

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        render: false //Set render state to false
    }
  }

  componentDidMount() {
    setTimeout(function() { //Start the timer
        this.setState({render: true}) //After 1 second, set render to true
    }.bind(this), 1000)
  }

  render() {
    let renderContainer = false //By default don't render anything

    const columns = [
      {
        name: "Client",
        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
                <a href={value.split("*")[0]}>{value.split("*")[1]}</a>
              );
          }
        }
      },
    "Unassigned\?", "Last Updated"];

    const options = {
      filterType: "dropdown",
      responsive: "stacked"};

    if(this.state.render) { //If this.state.render == true, which is set to true by the timer.
        renderContainer = <div
        style={{
          width: "calc(100 % - 100px)",
          marginLeft: "100px",
          height: "100%",
          position: "absolute"
        }}>
        <div style={{ height: "100%", width: "100%" }}>
          <Grow in={true}>
            <div style={{ margin: "150px 96px" }}>
              <MUIDataTable
                title={"My Cases"}
                data={data}
                columns={columns}
                options={options}
              />
            </div>
          </Grow>
        </div>
      </div>

  }

    return (
      renderContainer
    )
}
}

ReactDOM.render(<App />, document.getElementById("cases"));
