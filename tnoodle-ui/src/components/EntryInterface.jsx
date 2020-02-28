import React, { Component } from "react";
import { updatePassword, updateCompetitionName } from "../redux/ActionCreators";
import { connect } from "react-redux";

const mapStateToProps = store => ({
    editingDisabled: store.editingDisabled,
    competitionName: store.competitionName
});

const mapDispatchToProps = {
    updatePassword,
    updateCompetitionName
};

const EntryInterface = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class EntryInterface extends Component {
        constructor(props) {
            super(props);

            this.state = {
                editingDisabled: props.editingDisabled,
                competitionName: props.competitionName || "",
                password: "",
                showPassword: false
            };
        }

        componentDidMount = function() {
            this.props.updateCompetitionName(this.state.competitionName);
            this.props.updatePassword(this.state.password);
        };

        handleCompetitionNameChange = event => {
            let state = this.state;
            state.competitionName = event.target.value;
            this.setState(state);

            // Propagate the change.
            this.props.updateCompetitionName(this.state.competitionName);
        };

        handlePasswordChange = event => {
            let state = this.state;
            state.password = event.target.value;
            this.setState(state);

            this.props.updatePassword(this.state.password);
        };

        toogleShowPassword = () => {
            let state = this.state;
            state.showPassword = !state.showPassword;
            this.setState(state);
        };

        render() {
            return (
                <div className="container mt-2">
                    <div className="row">
                        <div className="col-md-6 text-left form-group">
                            <label className="font-weight-bold pr-1">
                                Competition Name
                            </label>
                            <input
                                className="form-control"
                                placeholder="Competition Name"
                                onChange={this.handleCompetitionNameChange}
                                value={this.state.competitionName}
                                disabled={this.state.disabled ? "disabled" : ""}
                            />
                        </div>

                        <div className="col-md-6 text-left form-group">
                            <label className="font-weight-bold pr-1">
                                Password
                            </label>
                            <input
                                className="form-control"
                                placeholder="Password"
                                type={this.state.showPassword ? "" : "password"}
                                onChange={this.handlePasswordChange}
                                value={this.state.password}
                            />
                            <div onClick={this.toogleShowPassword}>
                                <input
                                    type="checkbox"
                                    checked={this.state.showPassword}
                                    readOnly
                                />
                                <label>Show password</label>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
);

export default EntryInterface;
