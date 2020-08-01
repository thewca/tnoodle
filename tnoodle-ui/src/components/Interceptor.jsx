import React, { Component } from "react";
import fetchIntercept from "fetch-intercept";

class Interceptor extends Component {
    messageDurationInSeconds = 10;

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

        this.state = { message: "", stackTrace: "", showMore: false };
    }

    handleHttpError = (error) => {
        if (error.json) {
            error.json().then((data) => {
                this.updateMessage(data);
            });
        } else {
            this.updateMessage(error);
        }
    };

    updateMessage = (data) => {
        // Clear the message after some seconds
        let message = data.message || data.statusText || JSON.stringify(data);
        let stackTrace = data.stackTrace;

        setTimeout(() => {
            this.setState({
                ...this.state,
                message: "",
                showMore: false,
                stackTrace: "",
            });
        }, 1000 * this.messageDurationInSeconds);

        this.setState({ ...this.state, message, stackTrace });
    };

    setShowMore = () => this.setState({ ...this.state, showMore: true });

    showMore = () => {
        if (this.state.showMore) {
            return <React.Fragment>{this.state.stackTrace}</React.Fragment>;
        }
        return (
            <button
                role="button"
                className="btn btn-primary"
                onClick={this.setShowMore}
            >
                Show more
            </button>
        );
    };

    render() {
        if (!this.state.message) {
            return null;
        }
        return (
            <div className="row sticky-top">
                <div className={"col-12 alert alert-danger"}>
                    <p>{this.state.message}</p>
                    <p>{this.showMore()}</p>
                </div>
            </div>
        );
    }
}

export default Interceptor;
