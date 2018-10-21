import React from 'react';
import { Route, Switch } from 'react-router';

import Home from '../components/Home';
import NoMatch from '../components/NoMatch';
import SelectCompetition from '../components/SelectCompetition';
import ManageCompetition from '../components/ManageCompetition/ManageCompetition';

const router = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/competitions/" component={SelectCompetition} />
    <Route path="/competitions/:competitionId" component={ManageCompetition} />
    <Route component={NoMatch} />
  </Switch>
);

export default router;
