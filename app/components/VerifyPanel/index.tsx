import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import TouchID from 'react-native-touch-id';
import _ from 'lodash';

import {
  CIPHERS_BY_ROWS,
  PANEL_STATUS,
  PIN_LENGTH,
} from './verify-panel.options';
import { CipherRowProps, VerifyPanelProps } from './verify-panel.props';
import { styles, cipherRowStyles } from './verify-panel.styles';
import { DotsProgress } from '../DotsProgress';
import { VerifyPanelStatus } from '../../utils/types';
import { Keystore } from '../../services/keychain';

const CipherRow: React.FunctionComponent<CipherRowProps> = ({
  ciphers,
  isDisabled,
  onCipherPress,
}) => {
  const renderCipherCell = useCallback(
    (cipher: number) => {
      return (
        <TouchableOpacity
          disabled={isDisabled}
          key={`cipher-cell-${cipher}`}
          onPress={() => onCipherPress(cipher)}
          style={cipherRowStyles.cipherContainer}
        >
          <Text style={cipherRowStyles.cipherText}>{cipher}</Text>
        </TouchableOpacity>
      );
    },
    [onCipherPress, isDisabled],
  );

  return (
    <View style={cipherRowStyles.container}>
      {_.map(ciphers, renderCipherCell)}
    </View>
  );
};

//TODO: remove resetPin
// if (__DEV__) {
//   Keystore.resetPin();
// }

export const VerifyPanel: React.FunctionComponent<VerifyPanelProps> = ({
  onVerifySuccess,
}) => {
  /* ------ State ------ */

  const [panelStatus, setPanelStatus] = useState<VerifyPanelStatus>(
    PANEL_STATUS.UNDEFINED,
  );
  const [keychainPin, setKeychainPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isEnterPinAvailable, setIsEnterPinAvailable] = useState<boolean>(
    false,
  );

  /* ----- Flow parts ------ */

  const checkTouchID = useCallback(() => {
    TouchID.isSupported()
      .then((biometryType) => {
        console.tron.log('TouchID is available:', biometryType);
        setPanelStatus(PANEL_STATUS.TOUCH_ID);
      })
      .catch((error) => {
        console.tron.log('TouchID is unavailable:', error);
        setPanelStatus(PANEL_STATUS.CHECK_PIN_KEYCHAIN);
      });
  }, [setPanelStatus]);

  const checkPinKeychain = useCallback(() => {
    Keystore.getPin()
      // Got the key from keystore
      .then((pin) => {
        console.tron.log('checkPinKeychain GOT IT!', pin);
        if (pin) {
          setKeychainPin(pin);
          setPanelStatus(PANEL_STATUS.PIN_ENTER);
        } else {
          setPanelStatus(PANEL_STATUS.PIN_CREATE);
        }
      })
      // Key does not present
      .catch((err) => {
        console.tron.log('checkPinKeychain err', err);
        setPanelStatus(PANEL_STATUS.PIN_CREATE);
      });
  }, [setPanelStatus, setKeychainPin]);

  const activatePinInput = useCallback(() => setIsEnterPinAvailable(true), [
    setPanelStatus,
    setIsEnterPinAvailable,
  ]);

  const savePinToKeychain = useCallback(() => {
    Keystore.savePin(enteredPin).then(() => {
      console.tron.log('Pin saved to keystore!');
      setKeychainPin(enteredPin);
      setEnteredPin('');
      setPanelStatus(PANEL_STATUS.PIN_ENTER);
    });
  }, [enteredPin, setPanelStatus, setKeychainPin]);

  const verifyEnteredPin = useCallback(() => {
    if (keychainPin === enteredPin) {
      setPanelStatus(PANEL_STATUS.VERIFIED);
    } else {
      setEnteredPin('');
      setPanelStatus(PANEL_STATUS.PIN_ENTER);
    }
  }, [enteredPin, keychainPin, setPanelStatus]);

  const launchTouchID = useCallback(() => {
    const optionalConfigObject = {
      title: 'Authentication Required', // Android
      imageColor: '#e00606', // Android
      imageErrorColor: '#ff0000', // Android
      sensorDescription: 'Touch sensor', // Android
      sensorErrorDescription: 'Failed', // Android
      cancelText: 'Cancel', // Android
      fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
      unifiedErrors: false, // use unified error messages (default false)
      passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
    };

    TouchID.authenticate('To access your accounts', optionalConfigObject)
      .then(() => setPanelStatus(PANEL_STATUS.VERIFIED))
      .catch((error: any) => {
        console.tron.log('TouchID failed', error);
        setPanelStatus(PANEL_STATUS.CHECK_PIN_KEYCHAIN);
      });
  }, [setPanelStatus]);

  /* ------ Main flow useEffects ------ */

  useEffect(() => {
    if (enteredPin.length === PIN_LENGTH) {
      switch (panelStatus) {
        case PANEL_STATUS.PIN_CREATE:
          setIsEnterPinAvailable(false);
          setPanelStatus(PANEL_STATUS.SAVE_PIN_KEYCHAIN);
          break;
        case PANEL_STATUS.PIN_ENTER:
          setPanelStatus(PANEL_STATUS.PIN_VERIFY);
          break;
      }
    }
  }, [enteredPin]);

  useEffect(() => {
    switch (panelStatus) {
      default:
      case PANEL_STATUS.UNDEFINED:
        checkTouchID();
        break;
      case PANEL_STATUS.CHECK_PIN_KEYCHAIN:
        checkPinKeychain();
        break;
      case PANEL_STATUS.PIN_CREATE:
      case PANEL_STATUS.PIN_ENTER:
        activatePinInput();
        break;
      case PANEL_STATUS.SAVE_PIN_KEYCHAIN:
        savePinToKeychain();
      case PANEL_STATUS.PIN_VERIFY:
        verifyEnteredPin();
        break;
      case PANEL_STATUS.TOUCH_ID:
        launchTouchID();
        break;
      case PANEL_STATUS.VERIFIED:
        onVerifySuccess();
        break;
    }
  }, [panelStatus]);

  /* ------ UI callbacks ------ */

  const onCipherPress = useCallback(
    (cipher: number) => setEnteredPin(enteredPin + cipher),
    [enteredPin, setEnteredPin],
  );

  const getStatusLabel = useCallback((): string => {
    switch (panelStatus) {
      default:
        return 'Loading..';
      case PANEL_STATUS.PIN_CREATE:
        return 'Create PIN';
      case PANEL_STATUS.PIN_ENTER:
      case PANEL_STATUS.PIN_VERIFY:
        return 'Enter PIN';
      case PANEL_STATUS.TOUCH_ID:
        return 'Touch ID';
      case PANEL_STATUS.VERIFIED:
        return 'Verified';
    }
  }, [panelStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.panelHeaderContainer}>
        <Text style={styles.panelHeaderTitle}>{getStatusLabel()}</Text>
        <DotsProgress
          filledDotsAmount={enteredPin.length}
          dotsAmount={PIN_LENGTH}
        />
      </View>
      <FlatList
        data={CIPHERS_BY_ROWS}
        renderItem={({ item: ciphers }) => (
          <CipherRow
            ciphers={ciphers}
            onCipherPress={onCipherPress}
            isDisabled={!isEnterPinAvailable}
          />
        )}
        extraData={isEnterPinAvailable}
        keyExtractor={(item, index) => `cipher-row-${item.join()}-${index}`}
        scrollEnabled={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.listContainer}
      />
    </View>
  );
};
