'use client';

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import styles from './CommonChartGanttCard.module.css';
import { GanttChartOptions, CommonChartGanttCardProps, PeriodUnit } from '@/types/ganttTypes';
import { getMonthsBetween, getDaysInMonth, daysBetween } from '@/utils/dateUtils';

// Period별 하루당 픽셀 너비
const DAY_WIDTH_BY_PERIOD: Record<PeriodUnit, number> = {
    'week': 40,    // 100 -> 40 축소
    'month': 15,   // 40 -> 15 축소 (숫자가 겹치지 않는 선)
    'quarter': 6,  // 15 -> 6 축소
    'year': 4,     // 유지
};

const DEFAULT_PERIOD_OPTIONS: PeriodUnit[] = ['year', 'quarter', 'month', 'week'];

// 기본 옵션
/**
 * 기본 옵션
 * - props로 전달되는 options와 병합되어 실제 동작 옵션이 된다.
 * - 공통 컴포넌트에서 기본값을 명시해두기 위한 설정.
 */
const defaultOptions: GanttChartOptions<unknown> = {
    /** 좌측 리스트 영역 설정 */
    headerLeft: {
        dateDisplayFormat: 'korean',
        showTimelineList: true,
        defaultExpanded: false,
    },
    /** 우측 컨트롤(기간 선택, Today, 이동 버튼 등) 설정 */
    headerRight: {
        showPeriodSelector: true,
        selectedPeriod: 'year',
        showTodayButton: true,
        showPrevNextButtons: true,
        showNavigationButtons: true,
    },
    /** 헤더 공통 표시 방식(날짜 포맷, 기간 단위) 설정 */
    header: {
        dateDisplayFormat: 'korean',
        selectedPeriod: 'year',
    },
    /** 바디(차트 영역) 설정 */
    body: {
        /** 오늘 날짜 세로선 표시 여부 */
        showTodayLine: true,
    },
    /** 하단 컨트롤(스크롤바, 좌우 이동 버튼) 설정 */
    bottom: {
        showNavigationButtons: true,
        showScrollbar: true,
    },
};

/**
 * CommonChartGanttCard
 * Notion 스타일 간트차트 컴포넌트
 */
export default function CommonChartGanttCard<T>({
    tasks,
    getTaskId,
    getTaskStartDate,
    getTaskEndDate,
    height,
    syncLeftPanelScroll = true,
    options: propsOptions,
}: CommonChartGanttCardProps<T>) {
    // 옵션 병합
    const options = useMemo(() => ({
        ...defaultOptions,
        ...propsOptions,
        headerLeft: { ...defaultOptions.headerLeft, ...propsOptions?.headerLeft },
        headerRight: { ...defaultOptions.headerRight, ...propsOptions?.headerRight },
        header: { ...defaultOptions.header, ...(propsOptions as any)?.header },
        body: { ...defaultOptions.body, ...propsOptions?.body },
        bottom: { ...defaultOptions.bottom, ...propsOptions?.bottom },
    }) as GanttChartOptions<T>, [propsOptions]);

    // 기간 선택 State
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodUnit>(options.header.selectedPeriod);

    // 현재 Period에 따른 DAY_WIDTH
    const DAY_WIDTH = DAY_WIDTH_BY_PERIOD[selectedPeriod] || 4;

    const periodOptions = useMemo(() => {
        return (options.headerRight.periodOptions && options.headerRight.periodOptions.length > 0)
            ? options.headerRight.periodOptions
            : DEFAULT_PERIOD_OPTIONS;
    }, [options.headerRight.periodOptions]);

    // 좌측 패널 열림/닫힘 상태
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(
        options.headerLeft.defaultExpanded
    );

    // 동적 차트 범위 (오늘 기준 ±2년 6개월)
    const [chartRange, setChartRange] = useState(() => {
        const today = dayjs();
        return {
            start: today.subtract(30, 'month').startOf('month').format('YYYY-MM-DD'),
            end: today.add(30, 'month').endOf('month').format('YYYY-MM-DD'),
        };
    });

    // 좌측 오버레이에 표시할 년월
    const [overlayYearMonth, setOverlayYearMonth] = useState(() => {
        return dayjs().format('YYYY년 M월');
    });

    // 현재 마우스 오버된 태스크
    const [hoveredTask, setHoveredTask] = useState<T | null>(null);

    // 스크롤/뷰포트 (오버플로우 버튼 표시용)
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);
    // 오버플로우 버튼 호버 시 툴팁 (taskId | null, 'left' | 'right' | null)
    const [overflowTooltip, setOverflowTooltip] = useState<{ taskId: string; side: 'left' | 'right' } | null>(null);

    // Refs & State for Scroll Control
    const chartAreaRef = useRef<HTMLDivElement>(null);
    const timelineHeaderRef = useRef<HTMLDivElement>(null);
    const leftPanelListRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);
    const [scrollTrigger, setScrollTrigger] = useState(0); // 스크롤 강제 트리거
    /** 오버플로우 버튼으로 페이지를 넘긴 뒤, 새 범위에서 해당 막대로 스크롤하기 위한 대기 ref */
    const pendingScrollToTaskRef = useRef<{ task: T; side: 'left' | 'right' } | null>(null);

    // 월 목록
    const months = useMemo(() => {
        return getMonthsBetween(chartRange.start, chartRange.end);
    }, [chartRange]);

    // 전체 일수 계산
    const totalDays = useMemo(() => {
        return daysBetween(chartRange.start, chartRange.end) + 1;
    }, [chartRange]);


    // 오늘 날짜 정보
    const todayInfo = useMemo(() => {
        const today = dayjs().startOf('day');
        const startDayjs = dayjs(chartRange.start).startOf('day');
        const daysDiff = today.diff(startDayjs, 'day');
        const position = daysDiff * DAY_WIDTH + (DAY_WIDTH / 2);
        return {
            date: today,
            dayOfMonth: today.date(),
            month: today.month(),
            year: today.year(),
            position,
            dayIndex: daysDiff,
        };
    }, [chartRange, DAY_WIDTH]);

    // 바 위치 계산 함수
    const calculateBarPosition = useCallback((task: T) => {
        const startDayjs = dayjs(chartRange.start).startOf('day');
        const taskStart = dayjs(getTaskStartDate(task)).startOf('day');
        const taskEnd = dayjs(getTaskEndDate(task)).startOf('day');

        const startDiff = taskStart.diff(startDayjs, 'day');
        const duration = taskEnd.diff(taskStart, 'day') + 1;

        const left = startDiff * DAY_WIDTH;
        const width = duration * DAY_WIDTH;

        return {
            left,
            width,
            leftOverflow: left < 0,
            rightOverflow: left + width > totalDays * DAY_WIDTH,
        };
    }, [chartRange, totalDays, DAY_WIDTH, getTaskStartDate, getTaskEndDate]);

    // 주간 날짜 목록 생성 (1, 8, 15, 22, 29...)
    const getWeeklyDates = useCallback((month: Date) => {
        const monthStart = dayjs(month).startOf('month');
        const daysInMonth = monthStart.daysInMonth();
        const dates: number[] = [];

        // 매주 첫째날 (1, 8, 15, 22, 29)
        for (let day = 1; day <= daysInMonth; day += 7) {
            dates.push(day);
        }

        return dates;
    }, []);

    // 스크롤 위치에 따른 오버레이 년월 + 뷰포트 상태 업데이트
    const updateOverlayYearMonth = useCallback(() => {
        if (!chartAreaRef.current) return;

        const el = chartAreaRef.current;
        const scrollLeft = el.scrollLeft;
        const startDate = dayjs(chartRange.start);

        setScrollLeftState(scrollLeft);
        setViewportWidth(el.clientWidth);

        const daysFromStart = Math.floor(scrollLeft / DAY_WIDTH);
        const currentDate = startDate.add(daysFromStart, 'day');
        const overlayStr = `${currentDate.month() + 1}월 ${currentDate.year()}`;
        setOverlayYearMonth(overlayStr);
    }, [chartRange.start, DAY_WIDTH]);

    // 스크롤 동기화 & 뷰포트/오버플로우 상태 업데이트
    useEffect(() => {
        const chartArea = chartAreaRef.current;
        const timelineHeader = timelineHeaderRef.current;

        if (!chartArea || !timelineHeader) return;

        const handleScroll = () => {
            timelineHeader.scrollLeft = chartArea.scrollLeft;
            updateOverlayYearMonth();
            if (syncLeftPanelScroll && leftPanelListRef.current) {
                leftPanelListRef.current.scrollTop = chartArea.scrollTop;
            }
        };

        chartArea.addEventListener('scroll', handleScroll);
        updateOverlayYearMonth();
        if (syncLeftPanelScroll && leftPanelListRef.current) {
            leftPanelListRef.current.scrollTop = chartArea.scrollTop;
        }
        return () => chartArea.removeEventListener('scroll', handleScroll);
    }, [chartRange, updateOverlayYearMonth, syncLeftPanelScroll]);

    useEffect(() => {
        const leftPanelList = leftPanelListRef.current;
        if (!leftPanelList || !syncLeftPanelScroll) return;
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            chartAreaRef.current?.scrollBy({ top: event.deltaY });
        };
        leftPanelList.addEventListener('wheel', handleWheel, { passive: false });
        return () => leftPanelList.removeEventListener('wheel', handleWheel);
    }, [syncLeftPanelScroll]);

    // 리사이즈 시 뷰포트 너비 갱신
    useEffect(() => {
        const chartArea = chartAreaRef.current;
        if (!chartArea) return;
        const ro = new ResizeObserver(() => updateOverlayYearMonth());
        ro.observe(chartArea);
        return () => ro.disconnect();
    }, [updateOverlayYearMonth]);

    // 초기 스크롤, 페이징 후 중앙 이동, 오버플로우로 인한 페이지 이동 후 막대 스크롤
    useEffect(() => {
        if (!chartAreaRef.current) return;

        if (!initialScrollDone.current || scrollTrigger > 0) {
            const timer = setTimeout(() => {
                const chartArea = chartAreaRef.current;
                if (!chartArea) return;

                const pending = pendingScrollToTaskRef.current;
                if (pending) {
                    pendingScrollToTaskRef.current = null;
                    const { task, side } = pending;
                    const config = getPeriodConfig(selectedPeriod);
                    const startDayjs = dayjs(chartRange.start).startOf('day');
                    const taskStart = dayjs(getTaskStartDate(task)).startOf('day');
                    const taskEnd = dayjs(getTaskEndDate(task)).startOf('day');
                    const startDiff = taskStart.diff(startDayjs, 'day');
                    const duration = taskEnd.diff(taskStart, 'day') + 1;
                    const left = startDiff * DAY_WIDTH;
                    const width = duration * DAY_WIDTH;
                    const pad = 16;
                    const targetLeft = side === 'left'
                        ? left - pad
                        : left + width - chartArea.clientWidth + pad;
                    chartArea.scrollTo({
                        left: Math.max(0, Math.min(chartArea.scrollWidth - chartArea.clientWidth, targetLeft)),
                        behavior: 'smooth',
                    });
                    updateOverlayYearMonth();
                    return;
                }

                const scrollWidth = chartArea.scrollWidth;
                const clientWidth = chartArea.clientWidth;
                const centerScroll = (scrollWidth - clientWidth) / 2;
                const todayPositionPx = todayInfo.position;
                const todayScroll = todayPositionPx - (clientWidth / 2);
                const todayInRange = todayPositionPx >= 0 && todayPositionPx <= scrollWidth;
                const targetScroll = todayInRange ? todayScroll : centerScroll;
                chartArea.scrollTo({ left: Math.max(0, Math.min(scrollWidth - clientWidth, targetScroll)), behavior: 'auto' });
                initialScrollDone.current = true;
                updateOverlayYearMonth();
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [todayInfo.position, updateOverlayYearMonth, scrollTrigger, DAY_WIDTH, chartRange.start, selectedPeriod]);

    // 무한 스크롤 관련 스크롤 보정 useEffect 제거됨

    // 기간별 설정 반환 로직 (Move Unit 등)
    const getPeriodConfig = (period: PeriodUnit): { unit: dayjs.ManipulateType; halfRange: number; moveAmount: number } => {
        switch (period) {
            case 'year':
                return { unit: 'month', halfRange: 30, moveAmount: 30 }; // ±2.5년
            case 'quarter':
                return { unit: 'month', halfRange: 12, moveAmount: 12 }; // ±1년 (4분기)
            case 'month':
                return { unit: 'month', halfRange: 6, moveAmount: 6 };   // ±6개월
            case 'week':
                return { unit: 'week', halfRange: 4, moveAmount: 4 };    // ±4주
            default:
                return { unit: 'month', halfRange: 6, moveAmount: 6 };
        }
    };

    // 오늘 날짜로 이동 및 리셋 (useCallback)
    const moveToToday = useCallback(() => {
        const today = dayjs();
        const config = getPeriodConfig(selectedPeriod);

        setChartRange({
            start: today.subtract(config.halfRange, config.unit).startOf(config.unit === 'week' ? 'week' : 'month').format('YYYY-MM-DD'),
            end: today.add(config.halfRange, config.unit).endOf(config.unit === 'week' ? 'week' : 'month').format('YYYY-MM-DD'),
        });

        // 스크롤 트리거 발동 (useEffect 실행 유도)
        setScrollTrigger(prev => prev + 1);
    }, [selectedPeriod]);

    // Period 변경 시 자동으로 Today로 이동
    useEffect(() => {
        moveToToday();
    }, [selectedPeriod, moveToToday]);

    // Today 버튼 클릭 핸들러
    const handleTodayClick = () => {
        // Today 이동도 '중앙으로 가라'는 시그널이므로 moveToToday 호출로 범위 리셋 후 scrollTrigger
        moveToToday();
        setScrollTrigger(prev => prev + 1);
    };

    // 페이징 (기간 이동) 핸들러 (<<, >>)
    const handlePagePrev = () => {
        const config = getPeriodConfig(selectedPeriod);
        const newStart = dayjs(chartRange.start).subtract(config.moveAmount, config.unit).format('YYYY-MM-DD');
        const newEnd = dayjs(chartRange.end).subtract(config.moveAmount, config.unit).format('YYYY-MM-DD');

        setChartRange({ start: newStart, end: newEnd });
        setScrollTrigger(prev => prev + 1);
    };

    const handlePageNext = () => {
        const config = getPeriodConfig(selectedPeriod);
        const newStart = dayjs(chartRange.start).add(config.moveAmount, config.unit).format('YYYY-MM-DD');
        const newEnd = dayjs(chartRange.end).add(config.moveAmount, config.unit).format('YYYY-MM-DD');

        setChartRange({ start: newStart, end: newEnd });
        setScrollTrigger(prev => prev + 1);
    };

    // 개선된 페이징 핸들러 (startOf/endOf 보정)
    const handlePagePrevNew = () => {
        const config = getPeriodConfig(selectedPeriod);

        const newStart = dayjs(chartRange.start)
            .subtract(config.moveAmount, config.unit)
            .startOf(config.unit === 'week' ? 'week' : 'month')
            .format('YYYY-MM-DD');

        const newEnd = dayjs(chartRange.end)
            .subtract(config.moveAmount, config.unit)
            .endOf(config.unit === 'week' ? 'week' : 'month')
            .format('YYYY-MM-DD');

        setChartRange({ start: newStart, end: newEnd });
        setScrollTrigger(prev => prev + 1);
    };

    const handlePageNextNew = () => {
        const config = getPeriodConfig(selectedPeriod);

        const newStart = dayjs(chartRange.start)
            .add(config.moveAmount, config.unit)
            .startOf(config.unit === 'week' ? 'week' : 'month')
            .format('YYYY-MM-DD');

        const newEnd = dayjs(chartRange.end)
            .add(config.moveAmount, config.unit)
            .endOf(config.unit === 'week' ? 'week' : 'month')
            .format('YYYY-MM-DD');

        setChartRange({ start: newStart, end: newEnd });
        setScrollTrigger(prev => prev + 1);
    };

    // 좌/우 스크롤 핸들러 (원복: 화면 이동)
    const handleScrollLeft = () => {
        if (chartAreaRef.current) {
            const currentScroll = chartAreaRef.current.scrollLeft;
            const viewWidth = chartAreaRef.current.clientWidth;
            chartAreaRef.current.scrollTo({ left: currentScroll - viewWidth / 2, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (chartAreaRef.current) {
            const currentScroll = chartAreaRef.current.scrollLeft;
            const viewWidth = chartAreaRef.current.clientWidth;
            chartAreaRef.current.scrollTo({ left: currentScroll + viewWidth / 2, behavior: 'smooth' });
        }
    };

    /** 오버플로우 버튼 클릭 시 해당 막대가 보이도록 스크롤. 막대가 현재 페이지 밖이면 차트 범위를 넘긴 뒤 스크롤 */
    const scrollToShowBar = useCallback((task: T, side: 'left' | 'right') => {
        const chartArea = chartAreaRef.current;
        if (!chartArea) return;
        const barPos = calculateBarPosition(task);
        const contentWidth = totalDays * DAY_WIDTH;
        const pad = 16;

        const barLeft = barPos.left;
        const barRight = barPos.left + barPos.width;

        if (side === 'left' && barLeft < 0) {
            const config = getPeriodConfig(selectedPeriod);
            const pivot = dayjs(getTaskStartDate(task));
            const newStart = pivot.subtract(config.halfRange, config.unit)
                .startOf(config.unit === 'week' ? 'week' : 'month')
                .format('YYYY-MM-DD');
            const newEnd = pivot.add(config.halfRange, config.unit)
                .endOf(config.unit === 'week' ? 'week' : 'month')
                .format('YYYY-MM-DD');
            pendingScrollToTaskRef.current = { task, side: 'left' };
            setChartRange({ start: newStart, end: newEnd });
            setScrollTrigger(prev => prev + 1);
            return;
        }
        if (side === 'right' && barRight > contentWidth) {
            const config = getPeriodConfig(selectedPeriod);
            const pivot = dayjs(getTaskEndDate(task));
            const newStart = pivot.subtract(config.halfRange, config.unit)
                .startOf(config.unit === 'week' ? 'week' : 'month')
                .format('YYYY-MM-DD');
            const newEnd = pivot.add(config.halfRange, config.unit)
                .endOf(config.unit === 'week' ? 'week' : 'month')
                .format('YYYY-MM-DD');
            pendingScrollToTaskRef.current = { task, side: 'right' };
            setChartRange({ start: newStart, end: newEnd });
            setScrollTrigger(prev => prev + 1);
            return;
        }

        const targetLeft = side === 'left'
            ? Math.max(0, barPos.left - pad)
            : Math.min(chartArea.scrollWidth - chartArea.clientWidth, barPos.left + barPos.width - chartArea.clientWidth + pad);
        chartArea.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }, [calculateBarPosition, totalDays, DAY_WIDTH, selectedPeriod, getTaskStartDate, getTaskEndDate]);

    // 오늘이 표시 범위 내인지 확인
    const isTodayInRange = todayInfo.position > 0 && todayInfo.position < totalDays * DAY_WIDTH;

    return (
        <div className={styles.ganttCardContainer} style={{ height: height ?? '100%' }}>
            {/* 좌측 토글 버튼 (오버레이) */}
            <button
                className={styles.ganttToggleButton}
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                aria-label={isLeftPanelOpen ? '패널 닫기' : '패널 열기'}
            >
                {isLeftPanelOpen ? '«' : '»'}
            </button>

            {/* 좌측 패널 (오버레이) */}
            <div className={`${styles.ganttLeftPanel} ${isLeftPanelOpen ? '' : styles.collapsed}`}>
                <div className={styles.ganttLeftPanelHeader} />
                <div
                    className={`${styles.ganttTaskList} ${syncLeftPanelScroll ? styles.ganttTaskListSync : ''}`}
                    ref={leftPanelListRef}
                >
                    {tasks.length === 0 ? (
                        <div className={styles.ganttEmptyState}>
                            <span>태스크가 없습니다</span>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={getTaskId(task)} className={styles.ganttTaskRow}>
                                {options.renderLeftPanelContents ? options.renderLeftPanelContents(task) : null}
                            </div>
                        ))
                    )}
                </div>
            </div>



            {/* 메인 콘텐츠 영역 */}
            <div className={styles.ganttMainContent}>
                {/* Header - 좌측 년월 오버레이 + 우측 컨트롤 */}
                <div className={styles.ganttHeader}>
                    {/* 좌측: 현재 보이는 년월 (오버레이 방식) */}
                    <span className={styles.ganttOverlayYearMonth}>{overlayYearMonth}</span>

                    <div className={styles.ganttControlsRight}>
                        {/* 페이징 및 네비게이션 버튼 그룹 (Select 포함) */}
                        <div className={styles.ganttButtonGroup}>
                            <div className={styles.ganttSelectWrapper}>
                                <select
                                    className={styles.ganttSelect}
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value as PeriodUnit)}
                                >
                                    {periodOptions.map((period) => (
                                        <option key={period} value={period}>
                                            {options.header.dateDisplayFormat === 'korean'
                                                ? (period === 'year'
                                                    ? '년별'
                                                    : period === 'quarter'
                                                        ? '분기'
                                                        : period === 'month'
                                                            ? '월'
                                                            : '주')
                                                : (period === 'year'
                                                    ? 'Year'
                                                    : period === 'quarter'
                                                        ? 'Quarter'
                                                        : period === 'month'
                                                            ? 'Month'
                                                            : 'Week')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className={styles.ganttHeaderButton}
                                onClick={handlePagePrevNew}
                                title="이전 기간"
                            >
                                &lt;&lt;
                            </button>
                            <button
                                className={styles.ganttHeaderButton}
                                onClick={handleScrollLeft}
                                title="스크롤 왼쪽"
                            >
                                &lt;
                            </button>
                            <button
                                className={styles.ganttTodayButton}
                                onClick={handleTodayClick}
                            >
                                Today
                            </button>
                            <button
                                className={styles.ganttHeaderButton}
                                onClick={handleScrollRight}
                                title="스크롤 오른쪽"
                            >
                                &gt;
                            </button>
                            <button
                                className={styles.ganttHeaderButton}
                                onClick={handlePageNextNew}
                                title="다음 기간"
                            >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* 타임라인 헤더 (2줄: 월 + 일자) */}
                <div className={styles.ganttTimelineHeader} ref={timelineHeaderRef}>
                    <div
                        className={styles.ganttTimelineHeaderInner}
                        style={{ width: `${totalDays * DAY_WIDTH}px` }}
                    >
                        {/* 오늘 날짜 마크 (빨간 원) - 절대 위치로 헤더 전체 기준 */}
                        {isTodayInRange && (
                            <div
                                className={styles.ganttTodayMark}
                                style={{ left: `${todayInfo.position}px` }}
                            >
                                {todayInfo.dayOfMonth}
                            </div>
                        )}

                        {/* Hover된 태스크 기간 오버레이 (헤더에 표시) */}
                        {hoveredTask && (() => {
                            const { left, width } = calculateBarPosition(hoveredTask);
                            // 너비가 충분히 넓으면 양쪽 끝 정렬 (100px 기준)
                            const isWide = width >= 100;

                            const hoveredStartDate = getTaskStartDate(hoveredTask);
                            const hoveredEndDate = getTaskEndDate(hoveredTask);
                            const startDateStr = options.header.dateDisplayFormat === 'english'
                                ? dayjs(hoveredStartDate).format('MMM D')
                                : dayjs(hoveredStartDate).format('M월 D일');
                            const endDateStr = options.header.dateDisplayFormat === 'english'
                                ? dayjs(hoveredEndDate).format('MMM D')
                                : dayjs(hoveredEndDate).format('M월 D일');

                            return (
                                <div
                                    className={`${styles.ganttHeaderPeriodOverlay} ${isWide ? styles.wide : ''}`}
                                    style={{
                                        left: `${left}px`,
                                        // Wide 모드(100px 이상)면 바 너비에 강제 고정 (box-sizing: border-box 덕분에 정확히 일치)
                                        // 좁은 모드면 텍스트 길이에 따라 늘어남
                                        width: isWide ? `${width}px` : 'fit-content',
                                        minWidth: isWide ? '0' : `${width}px`,
                                        backgroundColor: options.header.periodOverlayStyle?.backgroundColor ?? '#f3f4f6',
                                        color: options.header.periodOverlayStyle?.color,
                                        borderColor: options.header.periodOverlayStyle?.borderColor,
                                        borderWidth: options.header.periodOverlayStyle?.borderWidth,
                                        borderStyle: options.header.periodOverlayStyle?.borderStyle,
                                    }}
                                >
                                    {isWide ? (
                                        <>
                                            <span>{startDateStr}</span>
                                            <span>{endDateStr}</span>
                                        </>
                                    ) : (
                                        `${startDateStr} - ${endDateStr}`
                                    )}
                                </div>
                            );
                        })()}

                        {months.map((month, idx) => {
                            const daysInMonth = getDaysInMonth(month);
                            const monthDate = dayjs(month);
                            const weeklyDates = getWeeklyDates(month);

                            return (
                                <div
                                    key={idx}
                                    className={styles.ganttMonthColumn}
                                    style={{ width: `${daysInMonth * DAY_WIDTH}px` }}
                                >
                                    {/* 첫째 줄: 월 이름 */}
                                    <div className={styles.ganttMonthRow}>
                                        <span className={styles.ganttMonthLabel}>
                                            {`${monthDate.month() + 1}월`}
                                        </span>
                                    </div>

                                    {/* 둘째 줄: 일자 숫자들 */}
                                    <div className={styles.ganttDayRow}>
                                        {weeklyDates.map(day => {
                                            const leftPos = (day - 1) * DAY_WIDTH;

                                            return (
                                                <span
                                                    key={day}
                                                    className={styles.ganttDayLabel}
                                                    style={{ left: `${leftPos}px` }}
                                                >
                                                    {day}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 차트 영역 */}
                <div className={styles.ganttChartArea} ref={chartAreaRef}>
                    <div
                        className={styles.ganttChartInner}
                        style={{ width: `${totalDays * DAY_WIDTH}px` }}
                    >
                        {/* 오늘 날짜 선 */}
                        {options.body.showTodayLine && isTodayInRange && (
                            <div
                                className={styles.ganttTodayLine}
                                style={{ left: `${todayInfo.position}px` }}
                            />
                        )}

                        {/* 차트 행들 */}
                        <div className={styles.ganttChartRows}>
                            {tasks.map(task => {
                                const barPosition = calculateBarPosition(task);
                                const barLeft = barPosition.left;
                                const barWidth = Math.max(barPosition.width, 20);
                                const barRight = barLeft + barWidth;
                                const visibleLeft = scrollLeftState;
                                const visibleRight = scrollLeftState + viewportWidth;
                                const leftOverflow = barLeft < visibleLeft;
                                const rightOverflow = barRight > visibleRight;

                                const overflowButtonWidth = 22;
                                const overflowButtonOffset = 4;
                                const leftButtonLeft = visibleLeft - barLeft + overflowButtonOffset;
                                const rightButtonLeft = visibleRight - barLeft - overflowButtonWidth - overflowButtonOffset;

                                const periodTooltipStr = options.header.dateDisplayFormat === 'english'
                                    ? `${dayjs(getTaskStartDate(task)).format('MMM D')} → ${dayjs(getTaskEndDate(task)).format('MMM D')}`
                                    : `${dayjs(getTaskStartDate(task)).format('M월 D일')} → ${dayjs(getTaskEndDate(task)).format('M월 D일')}`;

                                const barStyle = options.body.getBarStyle?.(task);
                                const hasCustomBackground = Boolean(barStyle?.backgroundColor);
                                const barBackground = hasCustomBackground ? barStyle?.backgroundColor : '#f3f4f6';
                                const barColor = barStyle?.color;
                                const hasCustomOutline = barStyle?.borderColor || barStyle?.borderWidth || barStyle?.borderStyle;
                                const outlineColor = barStyle?.borderColor ?? '#e5e7eb';
                                const outlineWidth = barStyle?.borderWidth ?? 1;
                                const outlineStyleType = barStyle?.borderStyle ?? 'solid';
                                const outlineStyle = hasCustomOutline
                                    ? (outlineStyleType === 'solid'
                                        ? { boxShadow: `inset 0 0 0 ${outlineWidth}px ${outlineColor}` }
                                        : { borderColor: outlineColor, borderWidth: outlineWidth, borderStyle: outlineStyleType })
                                    : { boxShadow: 'inset 0 0 0 1px #e5e7eb' };

                                return (
                                    <div key={getTaskId(task)} className={styles.ganttChartRow}>
                                        <div
                                            className={styles.ganttBar}
                                            style={{
                                                left: `${barPosition.left}px`,
                                                width: `${barWidth}px`,
                                                backgroundColor: barBackground,
                                                color: barColor,
                                                ...outlineStyle,
                                            }}
                                            onMouseEnter={() => setHoveredTask(task)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                        >
                                            {/* 바 내부 컨텐츠: 사용자 정의 render 옵션 또는 기본 데이터 이름 (스토리보드 10) */}
                                            {options.body.renderBarContents ? options.body.renderBarContents(task) : null}

                                            {/* 좌측 오버플로우 버튼: 막대가 왼쪽으로 잘릴 때 */}
                                            {leftOverflow && (
                                                <button
                                                    type="button"
                                                    className={styles.ganttBarOverflowButton}
                                                    style={{ left: `${leftButtonLeft}px` }}
                                                    onClick={(e) => { e.stopPropagation(); scrollToShowBar(task, 'left'); }}
                                                    onMouseEnter={() => setOverflowTooltip({ taskId: getTaskId(task), side: 'left' })}
                                                    onMouseLeave={() => setOverflowTooltip(null)}
                                                    title={periodTooltipStr}
                                                    aria-label="좌측으로 스크롤하여 막대 전체 보기"
                                                >
                                                    ←
                                                    {overflowTooltip?.taskId === getTaskId(task) && overflowTooltip?.side === 'left' && (
                                                        <span className={styles.ganttBarOverflowTooltip}>{periodTooltipStr}</span>
                                                    )}
                                                </button>
                                            )}

                                            {/* 우측 오버플로우 버튼: 막대가 오른쪽으로 잘릴 때 */}
                                            {rightOverflow && (
                                                <button
                                                    type="button"
                                                    className={`${styles.ganttBarOverflowButton} ${styles.ganttBarOverflowButtonRight}`}
                                                    style={{ left: `${rightButtonLeft}px` }}
                                                    onClick={(e) => { e.stopPropagation(); scrollToShowBar(task, 'right'); }}
                                                    onMouseEnter={() => setOverflowTooltip({ taskId: getTaskId(task), side: 'right' })}
                                                    onMouseLeave={() => setOverflowTooltip(null)}
                                                    title={periodTooltipStr}
                                                    aria-label="우측으로 스크롤하여 막대 전체 보기"
                                                >
                                                    →
                                                    {overflowTooltip?.taskId === getTaskId(task) && overflowTooltip?.side === 'right' && (
                                                        <span className={styles.ganttBarOverflowTooltip}>{periodTooltipStr}</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
