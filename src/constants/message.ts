export const MESSAGE = {
  error: {
    INVALID_EMAIL: '有効なメールアドレスを入力してください。',
    INVALID_NAME: 'ユーザー名は6〜20文字の英数字で入力してください。',
    INVALID_PASSWORD:
      'パスワードは8文字以上で、英字と数字をそれぞれ1文字以上含めてください。',
    PASSWORD_MISMATCH: 'パスワードと確認用パスワードが一致しません。',
    USER_NAME_EXISTS: 'そのユーザー名は既に使用されています。',
    RATE_LIMIT: '短時間にリクエストが集中しています。しばらくしてから再度お試しください。',
    SIGNUP_ERROR: '登録中にエラーが発生しました。再度お試しください。',
    INVALID_CREDENTIALS: 'ユーザー名またはパスワードが正しくありません。',
    CURRENT_PASSWORD_REQUIRED: '現在のパスワードを入力してください。',
    LOGIN_ERROR: 'ログイン中にエラーが発生しました。再度お試しください。',
    LOGOUT_ERROR: 'ログアウトに失敗しました。もう一度実行してください。',
    FEATCH_ANIME_ERROR: 'アニメの情報の取得に失敗しました。',
    FEATCH_TIERS_ERROR: 'ティア表の読み込みに失敗しました。',
    TIER_SAVE_ERROR: 'ティア表の保存に失敗しました。',
    TIER_NAME_REQUIRED: 'ティア表名を入力してください。',
    TIER_ITEM_REQUIRED: '保存できないティア項目が含まれています。',
    LOGIN_REQUIRED: 'ログイン状態が必要です。',
    WITHDRAWAL_ERROR: '退会処理に失敗しました。再度お試しください。',
    UNKNOWN: '予期せぬエラーが発生しました。'
  },
  info: {
    SIGNUP_SUCCESS: '登録が完了しました。ログインしてください。',
    PASSWORD_UPDATE_SUCCESS: 'パスワードを更新しました。',
    ANIME_NOTFOUND: '検索条件に一致するアニメが見つかりませんでした。',
    WITHDRAWAL_CONFIRM: '退会するとユーザー情報、ピックアップ、ティア表が削除され、ログアウトします。よろしいですか？'
  }
} as const;