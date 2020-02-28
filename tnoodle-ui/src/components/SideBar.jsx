import React, { Component } from "react";

class SideBar extends Component {
    render() {
        return (
            <div className="sticky-top">
                <img
                    className="tnoodle-logo mt-2"
                    src={require("../assets/tnoodle_logo.svg")}
                    alt="TNoodle logo"
                />
                <h1 className="display-3" id="title">
                    TNoodle
                </h1>
                <ul className="list-group">
                    <li>
                        <button
                            type="button"
                            className="btn btn-dark btn-lg btn-block btn-outline-light"
                        >
                            Manual Selection
                        </button>
                    </li>
                </ul>
            </div>
        );
    }
}

export default SideBar;
