import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

const geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 27000,
  distanceFilter: 1,
};

const App = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [showInputField, setShowInputField] = useState(false);
  const [errorText, setErrorText] = useState("no error");
  const [objectExists, setObjectExists] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: 0,
    lng: 0,
    alt: 0,
  });
  const [objectLocation, setObjectLocation] = useState({
    lat: 0,
    lng: 0,
    distance: 0,
  });

  const [inputs, setInputs] = useState({
    latitude: objectLocation.lat,
    longitude: objectLocation.lng,
  });

  // TO CHECK
  const [hasGeolocation, setHasGeolocation] = useState(false);

  const onSubmitCustom = () => {
    try {
      const { latitude, longitude } = inputs;
      const icon = document.querySelector("a-box");
      const inputField = document.querySelector("#input-field");

      const isLatitudeValid = isFinite(latitude) && Math.abs(latitude) <= 90;
      const isLongitudeValid =
        isFinite(longitude) && Math.abs(longitude) <= 180;

      if (isLatitudeValid && isLongitudeValid) {
        console.log("[DEBUG] :: ", { icon });
        if (icon) {
          icon.setAttribute(
            "gps-entity-place",
            `latitude: ${latitude}; longitude: ${longitude}`
          );
        }
        inputField.className = "input-container-hidden";
        setObjectLocation((prevState) => ({
          ...prevState,
          lat: latitude,
          lng: longitude,
        }));
        setShowInputField(false);
      } else {
        alert("please enter valid latitude & longitude");
      }
    } catch (err) {
      console.log(`onSubmitCustom :: ${err}`);
      setErrorText(`onSubmitCustom :: ${err}`);
    }
  };

  const onClickCustom = () => {
    try {
      const inputField = document.querySelector("#input-field");
      const btnText = document.querySelector("#btn-text");
      if (showInputField) {
        inputField.className = "input-container-hidden";
        btnText.innerHTML = "Custom";
      } else {
        inputField.className = "input-container";
        btnText.innerHTML = "Close";
      }
      setShowInputField(!showInputField);
    } catch (err) {
      console.log(`onClickCustom :: ${err}`);
      setErrorText(`onClickCustom :: ${err}`);
    }
  };

  const onClickInfo = () => {
    try {
      const arrow = document.querySelector(".arrow");
      const infoDescription = document.querySelector("#details");
      if (showInfo) {
        infoDescription.className = "info-details-hidden";
        arrow.style.transform = "rotate(360deg)";
      } else {
        infoDescription.className = "info-details";
        arrow.style.transform = "rotate(180deg)";
      }
      setShowInfo(!showInfo);
    } catch (err) {
      console.log(`onClickInfo :: ${err}`);
      setErrorText(`onClickInfo :: ${err}`);
    }
  };

  // GEOLOCATION =======================================================================
  const geolocationCurrentSuccess = (position) => {
    try {
      const { latitude, longitude, altitude } = position.coords;
      setUserLocation({
        lat: latitude,
        lng: longitude,
        alt: altitude,
      });
      setHasGeolocation(true);
      setObjectExists(true);
    } catch (err) {
      console.log(`geolocationCurrentSuccess :: ${err}`);
      setErrorText(`geolocationCurrentSuccess :: ${err}`);
      setHasGeolocation(false);
    }
  };

  const geolocationWatchSuccess = (position) => {
    try {
      const { latitude, longitude, altitude } = position.coords;
      setUserLocation({
        lat: latitude,
        lng: longitude,
        alt: altitude,
      });

      if (objectExists) {
        const distanceMsg = document
          .querySelector("[gps-entity-place]")
          .getAttribute("distanceMsg");
        console.log("[DEBUG] :: ", distanceMsg);
        setObjectLocation((prevState) => ({
          ...prevState,
          distance: distanceMsg,
        }));
      }
    } catch (err) {
      console.log(`geolocationWatchSuccess :: ${err}`);
      setErrorText(`geolocationWatchSuccess :: ${err}`);
      setHasGeolocation(false);
      setObjectExists(false);
    }
  };

  const geolocationError = (err) => {
    setErrorText(`geolocationError :: ${err}`);
    console.log("[ERROR] - currentPositionError :: ", { err });
  };

  useEffect(() => {
    if (hasGeolocation) {
      const { lat: latitude, lng: longitude, alt: altitude } = userLocation;
      const objectLatitude = latitude ? latitude + 0.0001 : latitude + 0.0001;
      const objectLongitude = longitude
        ? longitude + 0.0001
        : longitude + 0.0001;

      const scene = document.querySelector("a-scene");
      console.log("[DEBUG] :: ", { scene });
      const icon = document.createElement("a-box");
      icon.setAttribute("id", "aEntity");
      icon.setAttribute(
        "gps-entity-place",
        `latitude: ${objectLatitude.toFixed(
          4
        )}; longitude: ${objectLongitude.toFixed(4)};`
      );

      icon.setAttribute("width", "2");
      icon.setAttribute("height", "2");
      icon.setAttribute("depth", "2");
      icon.setAttribute("color", "red");
      icon.setAttribute("scale", "1 1 1");
      icon.setAttribute("position", `0 ${altitude + 1} 0`);
      icon.setAttribute("rotation", "5 0 0");

      icon.addEventListener("loaded", () =>
        window.dispatchEvent(new CustomEvent("gps-entity-place-loaded"))
      );

      const clickListener = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        alert("hey");
      };

      icon.addEventListener("click", clickListener);
      console.log("[DEBUG] :: ", { icon });
      scene.appendChild(icon);

      setObjectLocation({
        lat: objectLatitude.toFixed(4),
        lng: objectLongitude.toFixed(4),
      });
      setInputs({
        latitude: objectLatitude.toFixed(4),
        longitude: objectLongitude.toFixed(4),
      });
      setHasGeolocation(true);
      setObjectExists(true);
    }
  }, [hasGeolocation]);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      geolocationWatchSuccess,
      geolocationError,
      geoOptions
    );

    return () =>
      navigator.geolocation.clearWatch(
        geolocationWatchSuccess,
        geolocationError,
        geoOptions
      );
  }, [objectExists]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      geolocationCurrentSuccess,
      geolocationError,
      geoOptions
    );
  }, []);

  if (!hasGeolocation) {
    return (
      <div>
        <h3>Please enable location/motion/camera</h3>
        <div className="error-wrapper">
          <p id="error-text">{errorText}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="info-container">
          <div className="info-header" id="button-info" onClick={onClickInfo}>
            <p>Info</p>
            <p className="arrow">▼</p>
          </div>
          <div className="info-details-hidden" id="details">
            <h4>GeoAR - React v0.0.2</h4>
            <p id="latitude-text">latitude: {userLocation.lat}</p>
            <p id="longitude-text">altitude: {userLocation.lng}</p>
            <p id="altitude-text">longitude: {userLocation.alt}</p>
            <br />
            <h4>Object details</h4>
            <p id="object-latitude-text">Obj. Latitude: {objectLocation.lat}</p>
            <p id="object-longitude-text">
              Obj. Longitude: {objectLocation.lng}
            </p>
            <p id="distance-text">Distance: {objectLocation.distance}</p>
            <br />
          </div>
        </div>
        <div className="input-container-hidden" id="input-field">
          <div className="input-content">
            <div className="input-wrapper">
              <div className="input">
                <p>Latitude:</p>
                <input
                  type="text"
                  name="input-latitude"
                  id="input-latitude"
                  placeholder="latitude"
                  value={inputs.latitude}
                  onChange={(e) => {
                    setInputs((prevState) => ({
                      ...prevState,
                      latitude: e.target.value,
                    }));
                  }}
                />
              </div>
              <div className="input">
                <p>Longitude:</p>
                <input
                  type="text"
                  id="input-longitude"
                  placeholder="longitude"
                  value={inputs.longitude}
                  onChange={(e) => {
                    setInputs((prevState) => ({
                      ...prevState,
                      longitude: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <div id="btn-input" onClick={onSubmitCustom}>
              <p>Enter</p>
            </div>
          </div>
        </div>
        <div className="button-custom" id="btn-custom" onClick={onClickCustom}>
          <p id="btn-text">Custom</p>
        </div>
        <div className="error-wrapper">
          <p id="error-text">{errorText}</p>
        </div>
        <a-scene
          cursor="rayOrigin: mouse; fuse: true; fuseTimeout: 0;"
          raycaster="objects: [gps-entity-place];"
          vr-mode-ui="enabled: false"
          embedded
        >
          {/* <a-box
            width="10"
            height="10"
            depth="10"
            position="0 80 0"
            scale="1 1 1"
            color="red"
            rotation="5 0 0"
            gps-entity-place="latitude: 2.733615; longitude:101.894279;"
          /> */}
          <a-camera gps-camera rotation-reader></a-camera>
        </a-scene>
      </div>
    </div>
  );
};

export default App;
