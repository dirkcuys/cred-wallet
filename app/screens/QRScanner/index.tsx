import React, { FunctionComponent, useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useDispatch } from 'react-redux';

import { QRScannerScreenProps } from './qr-scanner.props';
import { styles } from './qr-scanner.styles';
import { generateExampleDid, parseCertificateDeeplink } from '../../utils';
import { useAddCertificateCallback } from '../../redux/certificates';

export const QRScannerScreen: FunctionComponent<QRScannerScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const addCertificate = useAddCertificateCallback(dispatch);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const onSuccess = useCallback(
    (result) => {
      const certificateDeeplink = parseCertificateDeeplink(result.data);
      addCertificate({
        did: generateExampleDid(),
        ...certificateDeeplink,
      });
      goBack();
    },
    [addCertificate, parseCertificateDeeplink, generateExampleDid, goBack],
  );

  return (
    <SafeAreaView style={styles.root}>
      <QRCodeScanner
        onRead={onSuccess}
        // vibrate?: boolean;
        // reactivate?: boolean;
        // reactivateTimeout?: number;
        fadeIn
        showMarker
        // cameraType?: 'front' | 'back';
        // customMarker?: JSX.Element;
        // containerStyle?: StyleProp<ViewStyle>;
        cameraStyle={styles.cameraContainer}
        markerStyle={styles.cameraMarkerContiner}
        // topViewStyle?: StyleProp<ViewStyle>;
        // bottomViewStyle?: StyleProp<ViewStyle>;
        // topContent?: JSX.Element | string;
        // bottomContent?: JSX.Element | string;
        // notAuthorizedView?: JSX.Element;
        // permissionDialogTitle?: string;
        // permissionDialogMessage?: string;
        // buttonPositive?: string;
        // checkAndroid6Permissions?: boolean;

        // cameraProps?: RNCameraProps;
        // inside // flashMode={RNCamera.Constants.FlashMode.torch}
        topContent={
          <TouchableOpacity
            onPress={goBack}
            style={styles.goBackZoneContainer}
          />
        }
        bottomContent={
          <TouchableOpacity onPress={goBack} style={styles.goBackZoneContainer}>
            <Text style={styles.descriptionText}>
              place the camera on the QR code
            </Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};
