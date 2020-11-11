import React, { FunctionComponent, useCallback } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

import { QRScannerScreenProps } from './qr-scanner.props';
import { styles } from './qr-scanner.styles';
import { parseCertificateDeeplink } from '../../utils';
import { NAVIGATION_TIME } from '../../utils/constants';

export const QRScannerScreen: FunctionComponent<QRScannerScreenProps> = ({
  navigation,
  // route,
}) => {
  const onSuccess = useCallback((e) => {
    const certificateDeeplink = parseCertificateDeeplink(e.data);
    navigation.goBack();
    setTimeout(
      () => navigation.navigate('AddCertificate', { certificateDeeplink }),
      NAVIGATION_TIME,
    );
  }, []);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

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
