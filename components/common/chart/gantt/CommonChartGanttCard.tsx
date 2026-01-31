'use client';

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import styles from './CommonChartGanttCard.module.css';
import { GanttTask, GanttChartOptions, CommonChartGanttCardProps, PeriodUnit } from '@/types/ganttTypes';
import { getMonthsBetween, getDaysInMonth, daysBetween } from '@/utils/dateUtils';

// Period별 하루당 픽셀 너비
const DAY_WIDTH_BY_PERIOD: Record<PeriodUnit, number> = {
    'Hours': 100,
    'Day': 50,
    'Week': 40,    // 100 -> 40 축소
    'Bi-week': 12,
    'Month': 15,   // 40 -> 15 축소 (숫자가 겹치지 않는 선)
    'Quarter': 6,  // 15 -> 6 축소
    'Year': 4,     // 유지
    '5 Years': 1,
};

// 기본 옵션
const defaultOptions: GanttChartOptions = {
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

/**
 * CommonChartGanttCard
 * Notion 스타일 간트차트 컴포넌트
 */
export default function CommonChartGanttCard({ tasks, options: propsOptions }: CommonChartGanttCardProps) {
    // 옵션 병합
    const options = useMemo(() => ({
        ...defaultOptions,
        ...propsOptions,
        headerLeft: { ...defaultOptions.headerLeft, ...propsOptions?.headerLeft },
        headerRight: { ...defaultOptions.headerRight, ...propsOptions?.headerRight },
        header: { ...defaultOptions.header, ...(propsOptions as any)?.header },
        body: { ...defaultOptions.body, ...propsOptions?.body },
        bottom: { ...defaultOptions.bottom, ...propsOptions?.bottom },
    }), [propsOptions]);

    // 기간 선택 State
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodUnit>(options.header.selectedPeriod);

    // 현재 Period에 따른 DAY_WIDTH
    const DAY_WIDTH = DAY_WIDTH_BY_PERIOD[selectedPeriod] || 4;

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
    const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);

    // Refs & State for Scroll Control
    const chartAreaRef = useRef<HTMLDivElement>(null);
    const timelineHeaderRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);
    const [scrollTrigger, setScrollTrigger] = useState(0); // 스크롤 강제 트리거

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
        return {
            date: today,
            dayOfMonth: today.date(),
            month: today.month(),
            year: today.year(),
            position: daysDiff * DAY_WIDTH + (DAY_WIDTH / 2),
            dayIndex: daysDiff,
        };
    }, [chartRange, DAY_WIDTH]);

    // 바 위치 계산 함수
    const calculateBarPosition = useCallback((task: GanttTask) => {
        const startDayjs = dayjs(chartRange.start).startOf('day');
        const taskStart = dayjs(task.startDate).startOf('day');
        const taskEnd = dayjs(task.endDate).startOf('day');

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
    }, [chartRange, totalDays, DAY_WIDTH]);

    // 상태 클래스 반환
    const getStatusClass = (status: string) => {
        const map: Record<string, string> = {
            'Planning': 'planning',
            'Development': 'development',
            'Review': 'review',
            'Completed': 'completed',
            '진행중': 'development',
            '완료': 'completed',
            '대기': 'planning',
        };
        return map[status] || 'planning';
    };

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

    // 스크롤 위치에 따른 오버레이 년월 업데이트
    const updateOverlayYearMonth = useCallback(() => {
        if (!chartAreaRef.current) return;

        const scrollLeft = chartAreaRef.current.scrollLeft;
        const startDate = dayjs(chartRange.start);

        // 스크롤 위치를 날짜로 변환
        const daysFromStart = Math.floor(scrollLeft / DAY_WIDTH);
        const currentDate = startDate.add(daysFromStart, 'day');

        setOverlayYearMonth(`${currentDate.month() + 1}월 ${currentDate.year()}`);
    }, [chartRange.start, DAY_WIDTH]);

    // 스크롤 동기화 & 무한 스크롤
    useEffect(() => {
        const chartArea = chartAreaRef.current;
        const timelineHeader = timelineHeaderRef.current;

        if (!chartArea || !timelineHeader) return;

        const handleScroll = () => {
            // 헤더 스크롤 동기화
            timelineHeader.scrollLeft = chartArea.scrollLeft;

            // 오버레이 년월 업데이트
            updateOverlayYearMonth();
        };

        chartArea.addEventListener('scroll', handleScroll);
        return () => chartArea.removeEventListener('scroll', handleScroll);
    }, [chartRange, updateOverlayYearMonth]);

    // 초기 스크롤 및 Today 이동 처리 (변경 없음)
    useEffect(() => {
        if (!chartAreaRef.current) return;

        // 초기 로드이거나 scrollTrigger가 변경되었을 때 스크롤 이동
        if (!initialScrollDone.current || scrollTrigger > 0) {
            // DOM 렌더링 후 정확한 위치 계산을 위해 약간의 지연 추가
            const timer = setTimeout(() => {
                if (chartAreaRef.current) {
                    const chartArea = chartAreaRef.current;

                    // 항상 차트 전체 범위의 정중앙으로 이동
                    // Today 버튼: 오늘 기준 ±2.5년이므로 중앙이 오늘
                    // 페이징: 2.5년씩 이동하므로 이동한 범위의 중앙이 새로운 중심점
                    const centerScroll = (chartArea.scrollWidth - chartArea.clientWidth) / 2;

                    // 'auto'로 즉시 이동하여 사용자 눈에 띄지 않게 함
                    chartArea.scrollTo({ left: Math.max(0, centerScroll), behavior: 'auto' });

                    initialScrollDone.current = true;
                    updateOverlayYearMonth();
                }
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [todayInfo.position, updateOverlayYearMonth, scrollTrigger, DAY_WIDTH]);

    // 무한 스크롤 관련 스크롤 보정 useEffect 제거됨

    // 기간별 설정 반환 로직 (Move Unit 등)
    const getPeriodConfig = (period: PeriodUnit): { unit: dayjs.ManipulateType; halfRange: number; moveAmount: number } => {
        switch (period) {
            case 'Year':
                return { unit: 'month', halfRange: 30, moveAmount: 30 }; // ±2.5년
            case 'Quarter':
                return { unit: 'month', halfRange: 12, moveAmount: 12 }; // ±1년 (4분기)
            case 'Month':
                return { unit: 'month', halfRange: 6, moveAmount: 6 };   // ±6개월
            case 'Week':
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

    // 오늘이 표시 범위 내인지 확인
    const isTodayInRange = todayInfo.position > 0 && todayInfo.position < totalDays * DAY_WIDTH;

    return (
        <div className={styles.ganttCardContainer}>
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
                <div className={styles.ganttTaskList}>
                    {tasks.length === 0 ? (
                        <div className={styles.ganttEmptyState}>
                            <span>태스크가 없습니다</span>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className={styles.ganttTaskRow}>
                                <span className={styles.ganttTaskTitle}>{task.title}</span>
                                <span className={`${styles.ganttTaskStatus} ${styles[getStatusClass(task.status)]}`}>
                                    {task.status}
                                </span>
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
                                    {options.header.dateDisplayFormat === 'korean' ? (
                                        <>
                                            <option value="Year">년별</option>
                                            <option value="Quarter">분기</option>
                                            <option value="Month">월</option>
                                            <option value="Week">주</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Year">Year</option>
                                            <option value="Quarter">Quarter</option>
                                            <option value="Month">Month</option>
                                            <option value="Week">Week</option>
                                        </>
                                    )}
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

                            const startDateStr = options.header.dateDisplayFormat === 'english'
                                ? dayjs(hoveredTask.startDate).format('MMM D')
                                : dayjs(hoveredTask.startDate).format('M월 D일');
                            const endDateStr = options.header.dateDisplayFormat === 'english'
                                ? dayjs(hoveredTask.endDate).format('MMM D')
                                : dayjs(hoveredTask.endDate).format('M월 D일');

                            return (
                                <div
                                    className={`${styles.ganttHeaderPeriodOverlay} ${isWide ? styles.wide : ''}`}
                                    style={{
                                        left: `${left}px`,
                                        // Wide 모드(100px 이상)면 바 너비에 강제 고정 (box-sizing: border-box 덕분에 정확히 일치)
                                        // 좁은 모드면 텍스트 길이에 따라 늘어남
                                        width: isWide ? `${width}px` : 'fit-content',
                                        minWidth: isWide ? '0' : `${width}px`,
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

                                return (
                                    <div key={task.id} className={styles.ganttChartRow}>
                                        <div
                                            className={`${styles.ganttBar} ${styles[getStatusClass(task.status)]}`}
                                            style={{
                                                left: `${barPosition.left}px`,
                                                width: `${Math.max(barPosition.width, 20)}px`,
                                            }}
                                            onMouseEnter={() => setHoveredTask(task)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                        >

                                            {/* 바 내부 컨텐츠 (너비가 충분할 때만 타이틀 표시) */}
                                            {barPosition.width >= 60 && (
                                                <span className={styles.ganttBarContent}>{task.title}</span>
                                            )}

                                            {(options.body.barContentDisplay === 'status' || options.body.barContentDisplay === 'both') && (
                                                <span className={`${styles.ganttBarStatus} ${styles[getStatusClass(task.status)]}`}>
                                                    {task.status}
                                                </span>
                                            )}

                                            {/* 바깥 텍스트 (너비가 좁을 때 표시) */}
                                            {barPosition.width < 60 && (
                                                <span className={styles.ganttBarOverflowText}>{task.title}</span>
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
