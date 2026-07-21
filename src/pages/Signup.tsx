import { useState } from 'react';
import { useSetAtom } from 'jotai';

import { spinnerAtom } from '../jotai/spinnerAtom';
import { MESSAGE } from '../constants/message';
import { CheckUserinfo } from '../utils/checkUserinfo';
import { signUp } from '../supabase/signUp';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';
import SEO from "../components/seo";

const Signup: React.FC = () => {
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();

  const [user_name, setUser_name] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // サインアップ実行
  const execSignUp = async () => {
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

    // パスワードと確認用パスワードの一致チェック
    if (!CheckUserinfo.doPasswordsMatch(password, confirmPassword)) {
      dialog.showDialog(MESSAGE.error.PASSWORD_MISMATCH);
      return;
    }

    try {
      setSpinner(true);
      await signUp(password, user_name);
      dialog.showDialog(MESSAGE.info.SIGNUP_SUCCESS, '/login', 'info');
      // リダイレクトはダイアログが閉じられたときに実行
    } catch (error) {
      if (error instanceof SupabaseError) {
        console.error('[SignUp Error]', {
          code: error.code,
          message: error.message,
          original: error.original,
        });
        switch (error.code) {
          case SupabaseErrorCode.USER_NAME_EXISTS:
            dialog.showDialog(MESSAGE.error.USER_NAME_EXISTS);
            break;
          case SupabaseErrorCode.RATE_LIMIT:
            dialog.showDialog(MESSAGE.error.RATE_LIMIT);
            break;
          default:
            dialog.showDialog(MESSAGE.error.SIGNUP_ERROR);
        }
      } else {
        console.error('[Unknown Error]', error);
        dialog.showDialog(MESSAGE.error.UNKNOWN);   
      } 
    } finally {
      setSpinner(false);
    }
  }
      
  return (
    <>
      <SEO title="新規登録画面" description="AniTierの新規登録画面です。" />
      <div className="flex flex-col items-center h-screen overflow-auto">
        <Dialog
          message={dialog.message}
          isOpen={dialog.isOpen}
          onClose={dialog.closeDialog}
          type={dialog.type}
          onCancel={dialog.closeCancel}
        />
        <p className="mt-30 text-4xl md:text-5xl font-black ">新規登録</p>
        <div className="flex flex-col h-fit justify-center mt-5 mb-30 w-2/5 max-w-xl min-w-80 bg-white border-gray-400 border p-10 rounded-lg shadow-lg gap-3">
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
          <>
            <p>パスワード確認用</p>
            <input
              type="password"
              placeholder="パスワード"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border mb-5 p-2 rounded-lg w-auto"
            />
          </>
          <button 
            className="bg-black text-white h-10 w-auto rounded-lg border"
            onClick={() => execSignUp()}
          >
            登録
          </button>
        </div>
      </div>
    </>
  );
};

export default Signup;
