import React from "react";
import { Link } from "react-router-dom";

function Navbar(props) {
  let offlineScramblerLink = props.offlineScramblerLink;
  let onlineScramblerLink = props.onlineScramblerLink;
  let aboutLink = props.aboutLink;
  return (
    <div id="navbar-wrapper">
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark static-top"
        id="navbar"
      >
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img
              className="tnoodle-logo"
              src={require("../assets/tnoodle_logo.svg")}
              alt="TNoodle logo"
            />
          </Link>
          <div className="">
            <Link to="/">
              <h1 className="display-3" id="title">
                TNoodle
              </h1>
            </Link>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to={offlineScramblerLink}>
                  Offline Scrambler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={onlineScramblerLink}>
                  Online Scrambler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={aboutLink}>
                  About
                </Link>
              </li>
              <li>
                <button
                  className="btn btn-outline-primary bg-light btn-lg"
                  onClick={props.isLogged ? props.logOut : props.logIn}
                >
                  {props.isLogged ? "Log out" : "Log in"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
