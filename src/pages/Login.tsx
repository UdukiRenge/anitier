import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { spinnerAtom } from '../jotai/spinnerAtom';
import { MESSAGE } from '../constants/message';
import { CheckUserinfo } from '../utils/checkUserinfo';
import { login } from '../supabase/login';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();

  const [user_name, setUser_name] = useState('');
  const [password, setPassword] = useState('');

  // ログイン実行
  const execLogin = async () => {
    // ユーザー名のバリデーションチェック
    if (!CheckUserinfo.isValidUserName(user_name)) {
      dialog.showDialog(MESSAGE.error.INVALID_NAME);
      return;
    }

    // パスワードのバリデーションチェック
    if (!CheckUserinfo.isValidPassword(password)) {
      dialog.showDialog(MESSAGE.error.INVALID_PASSWORD);
      return;
    }

    try {
      setSpinner(true);
      await login(user_name, password);
      navigate('/mypage');
    } catch (error) {
      if (error instanceof SupabaseError) {
        console.error('[Login Error]', {
          code: error.code,
          message: error.message,
          original: error.original,
        });

        switch (error.code) {
          case SupabaseErrorCode.INVALID_CREDENTIALS:
            dialog.showDialog(MESSAGE.error.INVALID_CREDENTIALS);
            break;
          case SupabaseErrorCode.RATE_LIMIT:
            dialog.showDialog(MESSAGE.error.RATE_LIMIT);
            break;
          default:
            dialog.showDialog(MESSAGE.error.LOGIN_ERROR);
        }
      } else {
        console.error('[Unknown Error]', error);
        dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
      }

    } finally {
      setSpinner(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />
      <p className="text-4xl md:text-5xl font-black ">ログイン</p>
      <div className="flex flex-col h-fit justify-center mt-5 w-2/5 max-w-xl min-w-80 bg-white border-gray-400 border p-10 rounded-lg shadow-lg gap-3">
        <>
          <p>ユーザー名</p>
          <input
            type="text"
            placeholder="ユーザー名" 
            value={user_name}
            onChange={(e) => setUser_name(e.target.value)}
            className="border mb-5 p-2 rounded-lg w-auto"
          />
        </>
          <>
          <p>パスワード</p>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="border mb-5 p-2 rounded-lg w-auto"
          />
        </>
        <button 
          className="bg-black text-white h-10 w-auto rounded-lg border"
          onClick={() => execLogin()}
        >
          ログイン
        </button>
      </div>
    </div>
  );
};

export default Login;

