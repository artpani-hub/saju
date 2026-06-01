import React from 'react';

const traitMap = {
  independence: '독립성',
  drive: '추진력',
  insight: '통찰력',
  patience: '인내심',
  competitiveness: '경쟁심(승부욕)',
  opportunity: '기회 포착',
  business: '사업 수완',
  negotiation: '협상력',
};

export default function JobTable({ matches }) {
  return (
    <div className="space-y-4">
      <h3 className="font-myeongjo text-xl font-bold text-[#1C1613]">
        🎯 직업 적성 처방
      </h3>
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-[#A3845B]/10">
          <tr>
            <th className="px-3 py-2 text-left">직업</th>
            <th className="px-3 py-2 text-left">연관 오행</th>
            <th className="px-3 py-2 text-left">핵심 성향</th>
            <th className="px-3 py-2 text-left">적합도</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((job, i) => (
            <tr key={i} className="border-b border-[#E2DDD5]/30">
              <td className="px-3 py-2">{job.name}</td>
              <td className="px-3 py-2">{job.o}</td>
              <td className="px-3 py-2">
                {job.s.map(key => traitMap[key] || key).join(' / ')}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{job.match}%</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded">
                    <div
                      className="h-full bg-[#A3845B]"
                      style={{ width: `${job.match}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[#5F5F5F] mt-2">
        * 적합도는 8대 성향 점수와 오행 비중을 종합한 결과이며, 높은 수치일수록 해당 직업에서 발휘될 잠재력이 큽니다.
      </p>
    </div>
  );
}
