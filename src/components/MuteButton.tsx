import { volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { IonButton, IonIcon } from "@ionic/react";
import { useState } from "react";
import { muteAllAudio, unmuteAllAudio, stopEmergencyTone } from "../lib/utils";


export const MuteButton = () => {
    const [muted, setMuted] = useState(true);

    const handleSound = () => {
        const next = !muted;
        setMuted(next);

        if(next) {
            muteAllAudio();
            stopEmergencyTone();
        } else {
            unmuteAllAudio();
        }
    }
    
    return (
        <IonButton className="hide-on-mobile" onClick={handleSound} color="white">
            <IonIcon icon={muted ? volumeMuteOutline : volumeHighOutline} slot="icon-only" />
        </IonButton>
    )
}