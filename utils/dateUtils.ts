import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 한국어 로케일 설정
dayjs.locale('ko');

// 날짜 포맷 상수
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const DISPLAY_FORMAT = 'YYYY년 MM월 DD일';
export const MONTH_FORMAT_KO = 'YYYY년 M월';
export const MONTH_FORMAT_EN = 'MMMM YYYY';

/**
 * 날짜를 지정된 포맷의 문자열로 변환
 * @param date - 변환할 날짜 (Date, string, dayjs 객체)
 * @param format - 출력 포맷 (기본: YYYY-MM-DD)
 */
export function formatDate(date: Date | string, format = DATE_FORMAT): string {
    return dayjs(date).format(format);
}

/**
 * 날짜에 일수를 더함
 * @param date - 기준 날짜
 * @param days - 더할 일수 (음수 가능)
 */
export function addDays(date: Date | string, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
}

/**
 * 날짜에 월수를 더함
 * @param date - 기준 날짜
 * @param months - 더할 월수 (음수 가능)
 */
export function addMonths(date: Date | string, months: number): Date {
    return dayjs(date).add(months, 'month').toDate();
}

/**
 * 두 날짜 사이의 일수 차이 계산
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 */
export function daysBetween(start: Date | string, end: Date | string): number {
    return dayjs(end).diff(dayjs(start), 'day');
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date | string): boolean {
    return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 날짜가 특정 범위 내에 있는지 확인
 */
export function isDateInRange(
    date: Date | string,
    start: Date | string,
    end: Date | string
): boolean {
    const d = dayjs(date);
    return d.isAfter(dayjs(start).subtract(1, 'day')) &&
        d.isBefore(dayjs(end).add(1, 'day'));
}

/**
 * 월의 첫 번째 날짜 반환
 * @param date - 기준 날짜
 */
export function getMonthStart(date: Date | string): Date {
    return dayjs(date).startOf('month').toDate();
}

/**
 * 월의 마지막 날짜 반환
 * @param date - 기준 날짜
 */
export function getMonthEnd(date: Date | string): Date {
    return dayjs(date).endOf('month').toDate();
}

/**
 * 두 날짜 사이의 모든 월 목록 반환
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 */
export function getMonthsBetween(start: Date | string, end: Date | string): Date[] {
    const months: Date[] = [];
    let current = dayjs(start).startOf('month');
    const endMonth = dayjs(end).startOf('month');

    while (current.isBefore(endMonth) || current.isSame(endMonth)) {
        months.push(current.toDate());
        current = current.add(1, 'month');
    }

    return months;
}

/**
 * 해당 월의 일수 반환
 * @param date - 기준 날짜
 */
export function getDaysInMonth(date: Date | string): number {
    return dayjs(date).daysInMonth();
}
