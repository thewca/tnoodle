import React, { Component } from "react";
import fetchIntercept from "fetch-intercept";

class Interceptor extends Component {
    errorMessageDurationInSeconds = 10;

    constructor() {
        super();

        const that = this;

        // http interceptor
        fetchIntercept.register({
            response: function (response) {
                if (!response.ok) {
                    that.handleHttpError(response);
                }
                return response;
            },

            responseError: function (error) {
                that.handleHttpError(error);
                return Promise.reject(error);
            },
        });

        this.state = { errorMessage: "" };
    }

    handleHttpError = (error) => {
        if (error.json) {
            error.json().then((data) => {
                let message =
                    data.message || data.statusText || JSON.stringify(data);
                this.updateErrorMessage(message);
            });
        } else {
            let message =
                error.message || error.statusText || JSON.stringify(error);
            this.updateErrorMessage(message);
        }
    };

    updateErrorMessage = (errorMessage) => {
        // Clear the message after some seconds
        setTimeout(() => {
            this.setState({ ...this.state, errorMessage: "" });
        }, 1000 * this.errorMessageDurationInSeconds);

        this.setState({ ...this.state, errorMessage });
    };

    render() {
        if (!this.state.errorMessage) {
            return null;
        }
        return (
            <div className="row sticky-top">
                <div className={"col-12 alert alert-danger"}>
                    {this.state.errorMessage}
                </div>
            </div>
        );
    }
}

export default Interceptor;
