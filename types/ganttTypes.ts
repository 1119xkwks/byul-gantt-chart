/**
 * 간트차트 관련 타입 정의
 */
import type { ReactNode } from 'react';

/**
 * 기간 표시 단위
 */
export type PeriodUnit = 'year' | 'quarter' | 'month' | 'week';

/**
 * 날짜 표시 형식
 */
export type DateDisplayFormat = 'korean' | 'english';

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
    /** 기간 선택 옵션 목록 (미지정 시 기본 4종) */
    periodOptions?: PeriodUnit[];
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
    /**
     * 헤더 기간 오버레이 스타일 (hover 시 표시되는 기간 표시)
     * backgroundColor/color/borderColor/borderWidth/borderStyle 지정 가능
     */
    periodOverlayStyle?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: 'solid' | 'dashed' | 'dotted';
    };
}

/**
 * Body 옵션
 */
export interface GanttBodyOptions<T> {
    /** 오늘 날짜 선 표시 여부 */
    showTodayLine: boolean;
    /**
     * 막대 내부 콘텐츠 사용자 정의 렌더 (스토리보드 10)
     * 제공 시 이 컴포넌트가 막대 안에 렌더되며, 미제공 시 빈 상태
     */
    renderBarContents?: (task: T) => ReactNode;
    /**
     * 막대 스타일 사용자 정의 (색상/아웃라인 포함)
     * backgroundColor/color: 막대 색상
     * borderColor/borderWidth/borderStyle: 아웃라인
     */
    getBarStyle?: (task: T) => {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: 'solid' | 'dashed' | 'dotted';
    };
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
export interface GanttChartOptions<T> {
    /** 헤더 좌측 옵션 */
    headerLeft: GanttHeaderLeftOptions;
    /** 헤더 우측 옵션 */
    headerRight: GanttHeaderRightOptions;
    /** 헤더 공통 옵션 */
    header: GanttHeaderOptions;
    /** Body 옵션 */
    body: GanttBodyOptions<T>;
    /** 하단 컨트롤러 옵션 */
    bottom: GanttBottomOptions;
    /** 좌측 목록 렌더 옵션 */
    renderLeftPanelContents?: (task: T) => ReactNode;
}

/**
 * CommonChartGanttCard 컴포넌트 Props
 */
export interface CommonChartGanttCardProps<T> {
    /** 태스크 데이터 목록 */
    tasks: T[];
    /** 태스크 ID */
    getTaskId: (task: T) => string;
    /** 태스크 시작 날짜 */
    getTaskStartDate: (task: T) => string;
    /** 태스크 종료 날짜 */
    getTaskEndDate: (task: T) => string;
    /** 차트 시작 날짜 (기본: 오늘 기준 이전 달) */
    startDate?: string;
    /** 차트 종료 날짜 (기본: 오늘 기준 다음 달) */
    endDate?: string;
    /** 컴포넌트 높이 (예: 600, '600px', '100%') */
    height?: number | string;
    /** 좌측 패널 스크롤 동기화 (기본: true) */
    syncLeftPanelScroll?: boolean;
    /** 리사이즈 시 Today 이동 (기본: true) */
    showTodayChartOnResize?: boolean;
    /** Today 이동 시 뷰포트 내 위치 비율 (0~1, 기본 0.5) */
    todayScrollPositionRatio?: number;
    /** 간트차트 옵션 */
    options?: Partial<GanttChartOptions<T>>;
}
