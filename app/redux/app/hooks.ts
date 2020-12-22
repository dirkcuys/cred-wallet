import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { AppDispatch, RootState } from '..';
import { LoadingType } from '../../utils/types';
import { appActionTypes } from './actions';

// Selector hooks
export const useIsVerificationProcess = () =>
  useSelector((state: RootState): boolean => state.app.isVerificationProcess);

export const useIsFirstVerification = () =>
  useSelector((state: RootState) => state.app.isFirstVerification);

export const useDeeplinkUrl = () =>
  useSelector((state: RootState): string | null => state.app.deeplinkUrl);

export const useLoading = () =>
  useSelector((state: RootState) => state.app.loading);

export const useErrors = () =>
  useSelector((state: RootState) => state.app.errors);

// Callback hooks
export const useSetVerificationProcessCallback = (dispatch: AppDispatch) =>
  useCallback(
    (isVerificationProcess: boolean) =>
      dispatch({
        type: appActionTypes.SET_VERIFICATION_PROCESS,
        isVerificationProcess,
      }),
    [dispatch],
  );

export const useSetFirstVerificationCallback = (dispatch: AppDispatch) =>
  useCallback(
    (isFirstVerification: boolean) =>
      dispatch({
        type: appActionTypes.SET_FIRST_VERIFICATION,
        isFirstVerification,
      }),
    [dispatch],
  );

export const useSetDeeplinkUrlCallback = (dispatch: AppDispatch) =>
  useCallback(
    (deeplinkUrl: string | null) =>
      dispatch({
        type: appActionTypes.SET_DEEPLINK_URL,
        deeplinkUrl,
      }),
    [],
  );
