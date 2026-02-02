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
  // 좌측 패널(리스트) 영역 옵션 묶음
  headerLeft: {
    // 헤더/날짜 표시 언어 포맷 (korean | english)
    dateDisplayFormat: 'korean',
    // 좌측 리스트(타임라인 목록) 표시 여부
    showTimelineList: true,
    // 좌측 패널 기본 펼침 여부
    defaultExpanded: false,
  },
  // 우측 컨트롤(기간 셀렉트/Today/이동 버튼) 옵션 묶음
  headerRight: {
    // 기간 선택 셀렉트 표시 여부
    showPeriodSelector: true,
    // 초기 선택 기간 단위 (year | quarter | month | week)
    selectedPeriod: 'quarter',
    // Today 버튼 표시 여부
    showTodayButton: true,
    // 이전/다음 버튼 표시 여부
    showPrevNextButtons: true,
    // 좌/우 네비게이션 버튼 표시 여부
    showNavigationButtons: true,
  },
  // 헤더 공통 옵션 묶음
  header: {
    // 헤더 날짜 표시 언어 포맷
    dateDisplayFormat: 'korean',
    // Hover 기간 오버레이 스타일
    periodOverlayStyle: {
      // 오버레이 배경색
      backgroundColor: '#f3f4f6',
      // 오버레이 텍스트 색상
      color: '#374151',
      // 오버레이 테두리 색상
      borderColor: '#e5e7eb',
      // 오버레이 테두리 두께
      borderWidth: 1,
      // 오버레이 테두리 스타일
      borderStyle: 'solid',
    },
  },
  // 차트 바디(그래프 영역) 옵션 묶음
  body: {
    // 오늘 세로선 표시 여부
    showTodayLine: true,
    // 막대 내부 렌더: 사용자 정의 컴포넌트 (없으면 빈 상태)
    renderBarContents: (task) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* 사용자 데이터 텍스트 예시 */}
        <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{task.title}</span>
        {/* 사용자 데이터 태그 예시 */}
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
    // 막대 스타일 지정 (색상/아웃라인)
    getBarStyle: (task) => ({
      // 막대 배경색
      backgroundColor: '#f3f4f6',
      // 막대 텍스트 색상
      color: 'inherit',
      // 막대 테두리 색상
      borderColor: '#e5e7eb',
      // 막대 테두리 두께
      borderWidth: 1,
      // 막대 테두리 스타일
      borderStyle: 'solid',
    }),
  },
  // 하단 컨트롤(스크롤바/이동 버튼) 옵션 묶음
  bottom: {
    // 좌우 이동 버튼 표시 여부
    showNavigationButtons: true,
    // 하단 스크롤바 표시 여부
    showScrollbar: true,
  },
  // 좌측 패널 아이템 렌더: 사용자 정의 컴포넌트
  renderLeftPanelContents: (task) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* 좌측 리스트 텍스트 예시 */}
      <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
        {task.title}
      </span>
      {/* 좌측 리스트 태그 예시 */}
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
