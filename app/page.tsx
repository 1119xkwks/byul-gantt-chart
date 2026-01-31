import CommonChartGanttCard from '@/components/common/chart/gantt/CommonChartGanttCard';

import type { GanttTask, GanttChartOptions } from '@/types/ganttTypes';

/**
 * Mock 데이터 - 간트차트 태스크 목록
 */
const mockTasks: GanttTask[] = [
  {
    id: '1',
    title: 'Front-End 환경 셋팅',
    status: 'Development',
    startDate: '2026-01-15',
    endDate: '2026-01-25',
    progress: 0,
  },
  {
    id: '2',
    title: 'Front-End 공통 개발',
    status: 'Development',
    startDate: '2026-01-20',
    endDate: '2026-02-05',
    progress: 0,
  },
  {
    id: '3',
    title: 'Back-End 환경 셋팅',
    status: 'Development',
    startDate: '2026-01-18',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '4',
    title: '인사관리',
    status: 'Development',
    startDate: '2026-01-20',
    endDate: '2026-02-01',
    progress: 0,
  },
  {
    id: '5',
    title: '근태관리',
    status: 'Development',
    startDate: '2026-01-25',
    endDate: '2026-02-10',
    progress: 0,
  },
  {
    id: '6',
    title: '기타관리',
    status: 'Development',
    startDate: '2026-02-01',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '7',
    title: '채팅',
    status: 'Development',
    startDate: '2026-02-05',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '8',
    title: '앱',
    status: 'Development',
    startDate: '2026-02-10',
    endDate: '2026-02-28',
    progress: 0,
  },
  {
    id: '9',
    title: '홈피드',
    status: 'Development',
    startDate: '2026-02-10',
    endDate: '2026-02-20',
    progress: 0,
  },
  {
    id: '10',
    title: '테스트',
    status: 'Review',
    startDate: '2026-02-25',
    endDate: '2026-05-10',
    progress: 0,
  },
];

/**
 * 간트차트 옵션 설정
 */
const ganttOptions: Partial<GanttChartOptions> = {
  headerLeft: {
    dateDisplayFormat: 'korean',
    showTimelineList: true,
    defaultExpanded: false,
  },
  headerRight: {
    showPeriodSelector: true,
    selectedPeriod: 'Year',
    showTodayButton: true,
    showPrevNextButtons: true,
    showNavigationButtons: true,
  },
  header: {
    dateDisplayFormat: 'korean',
    selectedPeriod: 'Year',
  },
  body: {
    showTodayLine: true,
    barContentDisplay: 'title',
  },
  bottom: {
    showNavigationButtons: true,
    showScrollbar: true,
  },
};

export default function Home() {
  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <div>Hello World</div>

      {/* 간트차트 컴포넌트 */}
      <div style={{ marginTop: '24px', height: '600px', border: '1px solid #e9e9e7', borderRadius: '4px' }}>
        <CommonChartGanttCard
          tasks={mockTasks}
          startDate="2025-09-01"
          endDate="2026-05-31"
          options={ganttOptions}
        />
      </div>
    </div>
  );
}
