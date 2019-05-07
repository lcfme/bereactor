const { createElement, Component, render } = require("./lib/bereact");

class App extends Component {
  constructor() {
    super();
    this.state = {
      color: "red",
      greeting: "Hello World"
    };
    console.log("App construct");
  }
  componentWillMount() {
    console.log("App componentWillMount");
  }
  componentWillUpdate() {
    console.log("App componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("App componentDidUpdate");
  }
  componentWillUnmount() {
    console.log("App componentWillUnmount");
  }
  render() {
    console.log("App render");
    return createElement(
      "div",
      {
        onClick: () => {
          this.setState({
            color: this.state.color === "red" ? "yellow" : "red",
            greeting: this.state.greeting
              .split("")
              .reverse()
              .join("")
          });
        },
        style: "color: " + this.state.color + ";"
      },
      this.state.greeting,
      createElement(Test, {
        greeting: this.state.greeting
      })
    );
  }
  componentDidMount() {
    console.log("App componentDidMount");
  }
}

class Test extends Component {
  constructor() {
    super();
    console.log("Test construct");
    this.state = {
      text: "I'm Test Component"
    };
  }
  render() {
    console.log("Test render");
    return createElement(
      "div",
      {
        onClick: e => {
          e.stopPropagation();
          this.setState({
            text:
              this.state.text === "Test Component is me"
                ? "I'm Test Component"
                : "Test Component is me"
          });
        }
      },
      this.state.text + " " + this.props.greeting
    );
  }
  componentWillMount() {
    console.log("Test componentWillMount");
  }
  componentDidMount() {
    console.log("Test componentDidMount");
  }
  componentWillUpdate() {
    console.log("Test componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("Test componentDidUpdate");
  }
  componentWillUnmount() {
    console.log("Test componentWillUnmount");
  }
}

const app = (window.app = render(
  createElement(App),
  document.querySelector("#app")
));
