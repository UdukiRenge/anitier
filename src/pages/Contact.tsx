import { useState } from 'react';

const Contact: React.FC = () => {

  const [inquirieInput, setInquirieInput] = useState<string>("");

  // ユーザー名の入力をstateに保存
  const handleChangeInquirie = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInquirieInput(value);      
  };

  const submitInquirie = async () => {
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* タイトル */}
      <p className="text-3xl font-bold text-center">
        お問い合わせ
      </p>
      <div
        className="
          mt-5
          w-3/4 md:w-1/2
          bg-white
          border border-gray-200
          rounded-xl
          shadow-lg
          p-8
          flex flex-col
          gap-4
        "
      >
        {/* 説明文 */}
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          お問い合わせ・ご要望がございましたら以下フォームからお送りください。
        </p>

        {/* テキストエリア */}
        <textarea
          className="
            w-full
            min-h-50
            p-3
            text-sm
            border border-gray-300
            rounded-lg
            resize-none
            outline-none
            focus:border-blue-600
            focus:ring-4
            focus:ring-blue-200
            transition
            
          "
          value={inquirieInput}
          onChange={handleChangeInquirie}
        />

        {/* 送信ボタン */}
        <button
          onClick={() => submitInquirie()}
          className="
            mt-2
            py-3
            text-base
            font-semibold
            text-white
            bg-blue-600
            rounded-lg
            hover:bg-blue-700
            active:scale-95
            transition
          "
        >
          送信
        </button>
      </div>
    </div>
  );
}

export default Contact;
