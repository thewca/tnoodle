import React from 'react';
import { connect } from 'react-redux';
import { object, func } from 'prop-types';
import DocumentTitle from 'react-document-title';
import SelectCompetition from './SelectCompetition';
import { fetchUpcomingManageableCompetitions } from '../../redux/actions/actions';

const propTypes = {
  competitions: object.isRequired,
  fetchUpcomingManageableCompetitions: func.isRequired
};

const SelectCompetitionContainer = props => (
  <DocumentTitle title="Select a competition">
    <SelectCompetition {...props} />
  </DocumentTitle>
);

SelectCompetitionContainer.propTypes = propTypes;

const mapStateToProps = state => ({
  competitions: state.upcomingManageableCompetitions
});

export default connect(
  mapStateToProps,
  {
    fetchUpcomingManageableCompetitions
  }
)(SelectCompetitionContainer);
