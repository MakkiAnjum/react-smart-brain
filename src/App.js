import React from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';

import './App.css';

const particlesOptions = {
  particles: {
    number: { value: 90, density: { enable: true, value_area: 800 } }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: { id: '', name: '', email: '', entries: 0, joined: '' }
};
class App extends React.Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    console.log(data)
    this.setState({
      user: { id: data.id, name: data.name, email: data.email, entries: data.entries, joined: data.joined }
    })
  }

  calculateFaceLocation = (response) => {
    const clarifaidata = response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaidata.left_col * width,
      topRow: clarifaidata.top_row * height,
      rightCol: width - (clarifaidata.right_col * width),
      bottomRow: height - (clarifaidata.bottom_row * height),
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box });
  };

  onInputChange = (e) => {
    this.setState({ input: e.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch("https://gentle-crag-85632.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        input: this.state.input
      }),
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch("https://gentle-crag-85632.herokuapp.com/image", {
            method: "put",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              this.setState(Object.assign(this.state.user, { entries: data }));
            }).catch(err => console.log(err));
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch((error) => console.log(error));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  }

  render() {
    return (
      <div className="App">
        <Particles
          className="particles"
          params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        {this.state.route === 'home' ?
          (<>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
          </>)
          : (
            this.state.route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )

        }
      </div>
    );
  }
}

export default App;
