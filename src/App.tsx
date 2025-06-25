import { Switch, Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonSplitPane
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import SOS from './pages/sos';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Dashboard2 from './pages/old-dashboard';
import Settings from './pages/settings';
// import MapPageLeaflet from './pages/MapPageLeaflet';
import MapPageGoogle from './pages/MapPageGoogle';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import 'leaflet/dist/leaflet.css';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth_context';
import Menu from './components/Menu';
import { Loader } from './components/Loader';

setupIonicReact();

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <IonReactRouter>
      <IonSplitPane contentId="main">
        {user && <Menu />}
        <IonRouterOutlet id="main">
          <Switch>
            {/* Protected Routes */}
            <ProtectedRoute path="/dashboard" component={Dashboard} exact />
            <ProtectedRoute path="/dashboard2" component={Dashboard2} exact />
            <ProtectedRoute path="/settings" component={Settings} exact />
            <ProtectedRoute path="/map" component={MapPageGoogle} exact />
            <ProtectedRoute path="/map/:lat/:lng" component={MapPageGoogle} exact />

            {/* Public Routes */}
            <Route exact path="/sos" component={SOS} />
            <Route exact path="/login" component={Login} />

            {/* Default redirect from "/" */}
            <Route exact path="/">
              <Redirect to={user ? "/dashboard" : "/sos"} />
            </Route>

            {/* Catch-all: only triggers if none above matched */}
            <Route path="*">
              <Redirect to={user ? "/dashboard" : "/login"} />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </IonApp>
  );
};

export default App;
