import { releaseNotes } from '../constants/releaseNotes';

const Release: React.FC = () => {
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="mt-17 font-bold text-3xl">リリースノート</h2>
      <table className="mt-5 mb-17 w-4/5 border-collapse bg-white shadow-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 p-3 text-left font-bold">
              バージョン
            </th>
            <th className="border border-gray-300 bg-gray-100 p-3 text-left font-bold">
              日付
            </th>
            <th className="border border-gray-300 bg-gray-100 p-3 text-left font-bold">
              変更内容
            </th>
          </tr>
        </thead>
        <tbody>
          {releaseNotes.map((note, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-3 align-top">
                {note.version}
              </td>
              <td className="border border-gray-300 p-3 align-top">
                {note.date}
              </td>
              <td className="border border-gray-300 p-3 align-top">
                <ul className="list-disc pl-5 space-y-1">
                  {note.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Release;