import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/auth_context';
import { IonSpinner } from '@ionic/react';

interface ProtectedRouteProps {
  component: React.ComponentType<object>;
  path: string;
  exact?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className='ion-padding ion-text-center' style={{ marginTop: '50vh', color: '#fff', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <IonSpinner style={{ color: '#fff !important' }} color="light" />
            <span>Loading..</span>.
        </div>
    );
  }


  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default ProtectedRoute;
