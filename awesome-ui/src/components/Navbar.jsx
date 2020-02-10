import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logIn, logOut, fetchMe, isLogged } from "../api/wca.api";
import { updateMe } from "../redux/ActionCreators";

const mapStateToProps = store => ({
  me: store.me
});

const mapDispatchToProps = {
  updateMe: updateMe
};

const Navbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        offlineScramblerLink: props.offlineScramblerLink,
        onlineScramblerLink: props.onlineScramblerLink,
        aboutLink: props.aboutLink,
        isLogged: isLogged()
      };
    }

    handleLogIn = () => {
      if (this.state.isLogged) {
        return;
      }
      logIn();
      fetchMe().then(me => {
        this.props.updateMe(me);
      });
    };

    handleLogOut = () => {
      logOut();
      this.setState({ ...this.state, me: null });
      this.props.updateMe(null);
    };

    render() {
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
                    <Link
                      className="nav-link"
                      to={this.state.offlineScramblerLink}
                    >
                      Offline Scrambler
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={this.state.onlineScramblerLink}
                    >
                      Online Scrambler
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={this.state.aboutLink}>
                      About
                    </Link>
                  </li>
                  <li>
                    <button
                      className="btn btn-outline-primary bg-light btn-lg"
                      onClick={
                        this.state.isLogged
                          ? this.handleLogOut
                          : this.handleLogIn
                      }
                    >
                      {this.state.isLogged ? "Log out" : "Log in"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      );
    }
  }
);

export default Navbar;
