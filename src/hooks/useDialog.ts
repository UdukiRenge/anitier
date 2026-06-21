import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface DialogState {
  isOpen: boolean;
  message: string;
  redirectPath?: string;
  type: 'alert' | 'confirm' | 'info';
  onConfirm?: (() => void | Promise<void>);
}

const useDialog = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    message: '',
    type: 'alert',
  });

  const showDialog = useCallback(
    (
      message: string,
      redirectPath?: string,
      type: 'alert' | 'confirm' | 'info' = 'alert',
      onConfirm?: () => void | Promise<void>
    ) => {
      setState({
        isOpen: true,
        message,
        redirectPath,
        type,
        onConfirm,
      });
    },
    []
  );

  const closeDialog = useCallback(async () => {
    const { redirectPath, onConfirm } = state;
    setState({
      isOpen: false,
      message: '',
      redirectPath: undefined,
      type: 'alert',
      onConfirm: undefined,
    });
    if (onConfirm) {
      try {
        await onConfirm();
      } catch (e) {
        console.error('onConfirm handler failed', e);
      }
    }
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [state, navigate]);

  const closeCancel = useCallback(() => {
    setState({
      isOpen: false,
      message: '',
      redirectPath: undefined,
      type: 'alert',
      onConfirm: undefined,
    });
  }, []);

  return {
    showDialog,
    closeDialog,
    closeCancel,
    ...state,
  };
};

export default useDialog;
