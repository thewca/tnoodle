import React, { Component } from "react";
import { updatePassword, updateCompetitionName } from "../redux/ActionCreators";
import { connect } from "react-redux";

const mapStateToProps = store => ({
    editingDisabled: store.editingDisabled,
    competitionName: store.wcif.name
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
                password: "",
                showPassword: false
            };
        }

        componentDidMount = function() {
            //this.props.updateCompetitionName(this.state.competitionName);
            //this.props.updatePassword(this.state.password);
        };

        handleCompetitionNameChange = event => {
            this.props.updateCompetitionName(event.target.value);
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
            let competitionName = this.props.competitionName;
            let disabled = this.props.editingDisabled;
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
                                value={competitionName}
                                disabled={disabled ? "disabled" : ""}
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
