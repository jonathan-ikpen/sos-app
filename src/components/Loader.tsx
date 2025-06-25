import { IonSpinner } from "@ionic/react";

export const Loader: React.FC = () => {
   return (
        <div className='ion-padding ion-text-center' style={{ marginTop: '50vh', color: '#fff', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <IonSpinner style={{ color: '#fff !important' }} color="light" />
            <span>Loading..</span>.
        </div>
    );
}