import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Clarifai, { COLOR_MODEL } from "clarifai";

import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";

import "tachyons";
import "./App.css";

const app = new Clarifai.App({
  apiKey: "67df80e557db4d228ed1b894282a57b4",
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "signin",
      isSignedIn: false,
    };
  }

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    //! FUNCTIONS THAT SEND THE PICTURE TO CLARIFAI API
    //! START

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = "67df80e557db4d228ed1b894282a57b4";
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = "g29pyxsulkqc";
    const APP_ID = "DanielPlasencia-FaceDetection";
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = "face-detection";
    const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: IMAGE_URL,
            },
          },
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch(
      "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) =>
        //console.log(JSON.parse(result).outputs[0].data.regions[0].region_info.bounding_box)
        this.displayFaceBox(this.calculateFaceLocation(JSON.parse(result)))
      )
      .catch((error) => console.log("error", error));

    //! END

    // app.models
    //   .predict(
    //     {
    //       id: "face-detection",
    //       name: "face-detection",
    //       version: "6dc7e46bc9124c5c8824be4822abe105",
    //       type: "visual-detector",
    //     },
    //     this.state.input
    //   )
    //   .then((response) => {
    //     console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    //   })
    //   .catch((err) => console.log("error", err));

    // app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input).then(
    //   function (response) {
    //     console.log(
    //       response.outputs[0].data.regions[0].region_info.bounding_box
    //     );
    //   },
    //   function (err) {
    //     console.log(err);
    //   }
    // );
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div>
        <div className="App">
          <ParticlesBg
            color="#ffffff"
            className="particles"
            type="cobweb"
            bg={true}
            num={200}
          />

          <Navigation
            onRouteChange={this.onRouteChange}
            isSignedIn={isSignedIn}
          />
          {route === "home" ? (
            <div>
              <Logo />
              <Rank />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          ) : route === "signin" ? (
            <Signin onRouteChange={this.onRouteChange} />
          ) : (
            <Register onRouteChange={this.onRouteChange} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
