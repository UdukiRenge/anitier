export class CheckUserinfo {
  /**
   * ユーザー名のバリデーション
   * 文字数：1〜20文字
   * 使用可能文字：半角英字・数字・記号
   */
  static isValidUserName(userName: string): boolean {
    const pattern =
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{1,20}$/;
    return pattern.test(userName);
  }

  /**
   * パスワードは8文字以上、英字と数字をそれぞれ1文字以上含む
   * 特殊文字は任意で使用可能
   */
  static isValidPassword(password: string): boolean {
    const passwordPattern =
      /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
    return passwordPattern.test(password);
  }

  /**
   * パスワードと確認用パスワードが一致するか確認
   */
  static doPasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }
}