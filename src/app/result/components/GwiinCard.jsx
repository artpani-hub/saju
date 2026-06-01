import { Chart } from 'react-chartjs-2';
import { useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export default function GwiinCard({ data }) {
  const chartData = {
    labels: Object.keys(data.breakdown),
    datasets: [
      {
        label: '귀인 연관도',
        data: Object.values(data.breakdown),
        backgroundColor: 'rgba(163,132,91,0.3)',
        borderColor: '#A3845B',
        borderWidth: 1,
        pointBackgroundColor: '#A3845B',
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 120,
        grid: { color: 'rgba(255,255,255,0.1)' },
        angleLines: { color: 'rgba(255,255,255,0.2)' },
        pointLabels: { color: '#FAF7F0' },
        ticks: { color: '#FAF7F0' },
      },
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-[#1C1613] text-[#FAF7F0] p-6 rounded-xl shadow-lg animate-fadeIn" style={{ height: '350px' }}>
      <h3 className="font-myeongjo text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="compass">
          🧭
        </span>{' '}
        귀인(貴人) 연관 분석
      </h3>
      <p className="text-sm mb-4">
        귀인은 인생에서 도움을 주는 중요한 스승·동료·인연을 의미합니다. 아래 그래프는 귀인과 연결된 주요 성향·오행 비중을 시각화한 것입니다.
      </p>
      <div className="relative h-full">
        <Chart type="radar" data={chartData} options={options} />
      </div>
      <p className="mt-4 text-xs">
        <strong>추천 활동:</strong> 귀인을 만나기 좋은 장소·네트워킹 이벤트, 협업 프로젝트, 멘토링 세션을 적극 활용하세요.
      </p>
    </div>
  );
}
