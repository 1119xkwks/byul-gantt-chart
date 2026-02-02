'use client';

import CommonChartGanttCard from '@/components/common/chart/gantt/CommonChartGanttCard';

import type { GanttChartOptions } from '@/types/ganttTypes';

type LocalTask = {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
};

/**
 * Mock 데이터 - 간트차트 태스크 목록
 */
const mockTasks: LocalTask[] = [
  {
    id: '1',
    title: 'Front-End 환경 셋팅',
    status: 'development',
    startDate: '2026-01-15',
    endDate: '2026-01-25',
    progress: 0,
  },
  {
    id: '2',
    title: 'Front-End 공통 개발',
    status: 'development',
    startDate: '2026-01-20',
    endDate: '2026-02-05',
    progress: 0,
  },
  {
    id: '3',
    title: 'Back-End 환경 셋팅',
    status: 'development',
    startDate: '2026-01-18',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '4',
    title: '인사관리',
    status: 'development',
    startDate: '2026-01-20',
    endDate: '2026-02-01',
    progress: 0,
  },
  {
    id: '5',
    title: '근태관리',
    status: 'development',
    startDate: '2026-01-25',
    endDate: '2026-02-10',
    progress: 0,
  },
  {
    id: '6',
    title: '기타관리',
    status: 'development',
    startDate: '2026-02-01',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '7',
    title: '채팅',
    status: 'development',
    startDate: '2026-02-05',
    endDate: '2026-02-15',
    progress: 0,
  },
  {
    id: '8',
    title: '앱',
    status: 'development',
    startDate: '2026-02-10',
    endDate: '2026-02-28',
    progress: 0,
  },
  {
    id: '9',
    title: '홈피드',
    status: 'development',
    startDate: '2026-02-10',
    endDate: '2026-02-20',
    progress: 0,
  },
  {
    id: '10',
    title: '테스트',
    status: 'review',
    startDate: '2026-02-25',
    endDate: '2026-05-10',
    progress: 0,
  },
  {
    id: '11',
    title: '111111',
    status: 'development',
    startDate: '2025-10-08',
    endDate: '2026-01-15',
    progress: 0,
  },
  {
    id: '12',
    title: '121212',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '13',
    title: '131313',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '14',
    title: '141414',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '15',
    title: '151515',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '16',
    title: '161616',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '17',
    title: '171717',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '18',
    title: '181818',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '19',
    title: '191919',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
  {
    id: '20',
    title: '202020',
    status: 'development',
    startDate: '2025-11-22',
    endDate: '2026-01-05',
    progress: 0,
  },
];

/**
 * 간트차트 옵션 설정
 */
const ganttOptions: Partial<GanttChartOptions<LocalTask>> = {
  headerLeft: {
    dateDisplayFormat: 'korean',
    showTimelineList: true,
    defaultExpanded: false,
  },
  headerRight: {
    showPeriodSelector: true,
    selectedPeriod: 'year',
    showTodayButton: true,
    showPrevNextButtons: true,
    showNavigationButtons: true,
  },
  header: {
    dateDisplayFormat: 'korean',
    periodOverlayStyle: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderStyle: 'solid',
    },
  },
  body: {
    showTodayLine: true,
    renderBarContents: (task) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{task.title}</span>
        <span
          style={{
            padding: '1px 4px',
            fontSize: '9px',
            borderRadius: '2px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            whiteSpace: 'nowrap',
          }}
        >
          {task.status}
        </span>
      </div>
    ),
    getBarStyle: (task) => ({
      backgroundColor: '#f3f4f6',
      color: 'inherit',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderStyle: 'solid',
    }),
  },
  bottom: {
    showNavigationButtons: true,
    showScrollbar: true,
  },
  renderLeftPanelContents: (task) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
        {task.title}
      </span>
      <span
        style={{
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: 500,
          borderRadius: '3px',
          backgroundColor: '#fef3c7',
          color: '#d97706',
        }}
      >
        {task.status}
      </span>
    </div>
  ),
};

export default function Home() {
  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <div>Hello World</div>

      {/* 간트차트 컴포넌트 */}
      <div style={{ marginTop: '24px', height: '600px', border: '1px solid #e9e9e7', borderRadius: '4px' }}>
        <CommonChartGanttCard
          tasks={mockTasks}
          getTaskId={(task) => task.id}
          getTaskStartDate={(task) => task.startDate}
          getTaskEndDate={(task) => task.endDate}
          startDate="2025-09-01"
          endDate="2026-05-31"
          options={ganttOptions}
          showTodayChartOnResize={true}
          todayScrollPositionRatio={0.5}
        />
      </div>
    </div>
  );
}
