/**
 * 간트차트 관련 타입 정의
 */

/**
 * 간트차트 태스크 상태
 */
export type TaskStatus = 'Planning' | 'Development' | 'Review' | 'Completed';

/**
 * 기간 표시 단위
 */
export type PeriodUnit = 'Hours' | 'Day' | 'Week' | 'Bi-week' | 'Month' | 'Quarter' | 'Year' | '5 Years';

/**
 * 날짜 표시 형식
 */
export type DateDisplayFormat = 'korean' | 'english';

/**
 * 간트차트 태스크 데이터
 */
export interface GanttTask {
    /** 태스크 고유 ID */
    id: string;
    /** 태스크 제목 */
    title: string;
    /** 태스크 상태 */
    status: TaskStatus;
    /** 시작 날짜 (YYYY-MM-DD) */
    startDate: string;
    /** 종료 날짜 (YYYY-MM-DD) */
    endDate: string;
    /** 진행률 (0-100) */
    progress: number;
    /** 상위 태스크 ID (없으면 최상위) */
    parentId?: string;
    /** 하위 태스크 목록 */
    children?: GanttTask[];
    /** 태스크 레벨 (계층 깊이) */
    level?: number;
    /** 태스크 확장 여부 */
    isExpanded?: boolean;
}

/**
 * 헤더 좌측 옵션
 */
export interface GanttHeaderLeftOptions {
    /** 년월 표시 형식 */
    dateDisplayFormat: DateDisplayFormat;
    /** 타임라인 목록 표시 여부 */
    showTimelineList: boolean;
    /** 펼침/접힘 기본값 */
    defaultExpanded: boolean;
}

/**
 * 헤더 우측 옵션
 */
export interface GanttHeaderRightOptions {
    /** 기간 선택 드롭다운 표시 여부 */
    showPeriodSelector: boolean;
    /** 선택된 기간 단위 */
    selectedPeriod: PeriodUnit;
    /** Today 버튼 표시 여부 */
    showTodayButton: boolean;
    /** 이전/다음 버튼 표시 여부 */
    showPrevNextButtons: boolean;
    /** 네비게이션 버튼 표시 여부 (이전/다음) */
    showNavigationButtons?: boolean;
}

/**
 * Header 공통 옵션
 */
export interface GanttHeaderOptions {
    /** 날짜 표시 형식 */
    dateDisplayFormat: DateDisplayFormat;
    /** 선택된 기간 단위 */
    selectedPeriod: PeriodUnit;
}

/**
 * Body 옵션
 */
export interface GanttBodyOptions {
    /** 오늘 날짜 선 표시 여부 */
    showTodayLine: boolean;
    /** 바 내용 표시 옵션 */
    barContentDisplay: 'title' | 'status' | 'both' | 'none';
}

/**
 * 하단 컨트롤러 옵션
 */
export interface GanttBottomOptions {
    /** 좌/우 이동 버튼 표시 여부 */
    showNavigationButtons: boolean;
    /** 스크롤바 표시 여부 */
    showScrollbar: boolean;
}

/**
 * 간트차트 전체 옵션
 */
export interface GanttChartOptions {
    /** 헤더 좌측 옵션 */
    headerLeft: GanttHeaderLeftOptions;
    /** 헤더 우측 옵션 */
    headerRight: GanttHeaderRightOptions;
    /** 헤더 공통 옵션 */
    header: GanttHeaderOptions;
    /** Body 옵션 */
    body: GanttBodyOptions;
    /** 하단 컨트롤러 옵션 */
    bottom: GanttBottomOptions;
}

/**
 * CommonChartGanttCard 컴포넌트 Props
 */
export interface CommonChartGanttCardProps {
    /** 태스크 데이터 목록 */
    tasks: GanttTask[];
    /** 차트 시작 날짜 (기본: 오늘 기준 이전 달) */
    startDate?: string;
    /** 차트 종료 날짜 (기본: 오늘 기준 다음 달) */
    endDate?: string;
    /** 간트차트 옵션 */
    options?: Partial<GanttChartOptions>;
}
