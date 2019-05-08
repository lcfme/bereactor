const { createElement, Component, render } = require("./lib/bereact");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      greeting: "Hello world"
    };
  }
  componentWillMount() {
    console.log("App componentWillMount");
  }
  componentDidMount() {
    console.log("App componentDidMount");
  }
  componentDidUpdate() {
    console.log("App componentDidUpdate");
  }
  render() {
    return createElement(
      "div",
      { style: "color: skyblue;" },
      this.state.greeting,
      createElement("input", {
        onInput: e => {
          this.setState({
            greeting: e.target.value
          });
        }
      }),
      createElement(ChildCompo, {
        greeting: this.state.greeting
          .split("")
          .reverse()
          .join("")
      })
    );
  }
}

class ChildCompo extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    console.log("ChildCompo componentWillMount");
  }
  componentDidMount() {
    console.log("ChildCompo componentDidMount");
  }
  render() {
    return createElement(
      "div",
      { id: "test", style: "color: pink;" },
      "我是子节点",
      "这是传入的props",
      this.props.greeting
    );
  }
}
const app = render(createElement(App, null), document.querySelector("#app"));
