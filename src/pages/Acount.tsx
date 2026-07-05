import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { spinnerAtom } from '../jotai/spinnerAtom';
import { fetchAccountInfo } from '../supabase/fetchAccountInfo';
import { updatePassword } from '../supabase/updatePassword';
import { deleteAllPickups } from '../supabase/deletePickups';
import { deleteTiers } from '../supabase/deleteTier';
import { deleteUser } from '../supabase/deleteUser';
import { fetchTiers } from '../supabase/fetchTiers';
import { logout } from '../supabase/logout';
import { MESSAGE } from '../constants/message';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import { CheckUserinfo } from '../utils/checkUserinfo';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';

const Acount: React.FC = () => {
  const navigate = useNavigate();
  const dialog = useDialog();

  const [editMode, setEditMode] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [userId, setUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const setSpinner = useSetAtom(spinnerAtom);

  // パスワード更新処理
  const execUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      dialog.showDialog(MESSAGE.error.CURRENT_PASSWORD_REQUIRED);
      return;
    }

    if (!CheckUserinfo.isValidPassword(newPassword)) {
      dialog.showDialog(MESSAGE.error.INVALID_PASSWORD);
      return;
    }

    if (!CheckUserinfo.doPasswordsMatch(newPassword, confirmPassword)) {
      dialog.showDialog(MESSAGE.error.PASSWORD_MISMATCH);
      return;
    }

    try {
      setSpinner(true);
      await updatePassword(currentPassword, newPassword);
      dialog.showDialog(MESSAGE.info.PASSWORD_UPDATE_SUCCESS, undefined, 'info');
      setEditMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('[Password Update Error]', error);

      if (error instanceof SupabaseError) {
        switch (error.code) {
          case SupabaseErrorCode.INVALID_CREDENTIALS:
            dialog.showDialog(MESSAGE.error.INVALID_CREDENTIALS);
            break;
          case SupabaseErrorCode.RATE_LIMIT:
            dialog.showDialog(MESSAGE.error.RATE_LIMIT);
            break;
          default:
            dialog.showDialog(MESSAGE.error.UNKNOWN);
        }
      } else {
        dialog.showDialog(MESSAGE.error.UNKNOWN);
      }
    } finally {
      setSpinner(false);
    }
  };

  const execWithdraw = async () => {
    if (!userId) {
      dialog.showDialog(MESSAGE.error.UNKNOWN);
      return;
    }

    try {
      setIsWithdrawing(true);
      setSpinner(true);

      const tiers = await fetchTiers(userId);
      await deleteAllPickups();
      await deleteTiers(tiers.map((tier) => tier.tier_id));
      await deleteUser();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('[Withdraw Error]', error);
      dialog.showDialog(MESSAGE.error.WITHDRAWAL_ERROR);
    } finally {
      setSpinner(false);
      setIsWithdrawing(false);
    }
  };

  // 初回レンダリング時にユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setSpinner(true);

        const { loginId, userId } = await fetchAccountInfo();

        setLoginId(loginId);
        setUserId(userId);
      } catch (error) {
        console.error('[Account Info Error]', error);

        if (error instanceof SupabaseError) {
          switch (error.code) {
            case SupabaseErrorCode.UNAUTHORIZED:
              dialog.showDialog(MESSAGE.error.INVALID_CREDENTIALS, '/');
              break;
            case SupabaseErrorCode.RATE_LIMIT:
              dialog.showDialog(MESSAGE.error.RATE_LIMIT);
              break;
            default:
              dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
          }
        } else {
          dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
        }
      } finally {
        setSpinner(false);
      }
    };

    fetchUserInfo();
  }, [setSpinner]);

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${editMode ? 'my-20' : ''}`}>
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />
      <p className="text-4xl md:text-5xl font-black ">ユーザー情報編集</p>
      <div className="flex flex-col h-fit justify-center mt-5 w-2/5 max-w-xl min-w-80 bg-white border-gray-400 border p-10 rounded-lg shadow-lg gap-3">
        <>
          <p>ユーザー名</p>
          <input
            type="text"
            value={loginId || '読み込み中...'}
            className="border mb-5 p-2 rounded-lg w-auto bg-gray-100"
            disabled
          />
        </>
        {editMode && (
          <>
            <>
              <p>現在のパスワード</p>
              <input
                type="password"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border mb-5 p-2 rounded-lg w-auto"
              />
            </>
            <>
              <p>新しいパスワード</p>
              <input
                type="password"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border mb-5 p-2 rounded-lg w-auto"
              />
            </>
            <>
              <p>新しいパスワード（確認用）</p>
              <input
                type="password"
                placeholder="確認用パスワード"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border mb-5 p-2 rounded-lg w-auto"
              />
            </>
          </>
        )}
        {!editMode && (
          <>
            <p>パスワード</p>
            <input
              type="password"
              value="********"
              className="border mb-5 p-2 rounded-lg w-auto bg-gray-100"
              disabled
              readOnly
            />
            <p className="text-sm text-gray-500 -mt-3 mb-3">※ パスワードは表示できません。変更時に新しいパスワードを入力してください。</p>
          </>
        )}
        <div className="flex justify-between mt-5">
          {editMode && (
            <>
              <button
                className="bg-black text-white h-10 w-2/5 rounded-lg border"
                onClick={() => execUpdatePassword()}
              >
                更新
              </button>
              <button
                className="bg-white text-black h-10 w-2/5 rounded-lg border"
                onClick={() => {
                  setEditMode(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                キャンセル
              </button>
            </>
          )}
          {!editMode && (
            <>
              <button 
                className="bg-black text-white h-10 w-2/5 rounded-lg border"
                onClick={() => setEditMode(!editMode)}
              >
                パスワード変更
              </button>
              <button 
                className="bg-red-500 text-white h-10 w-2/5 rounded-lg border"
                onClick={() =>
                  dialog.showDialog(
                    MESSAGE.info.WITHDRAWAL_CONFIRM,
                    undefined,
                    'confirm',
                    execWithdraw
                  )
                }
                disabled={isWithdrawing}
              >
                ユーザー退会
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Acount;

