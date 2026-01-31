---
name: Component Skill
description: 프로젝트 폴더 구조 및 컴포넌트 관리 가이드라인
---

# 프로젝트 폴더 구조

## 전체 구조

```
.
├── app/                 # ✅ 라우팅 전용
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
│
├── components/          # 공통 UI 컴포넌트
│   ├── common/
│   │   ├── CommonButton.tsx
│   │   └── CommonInput.tsx
│   ├── layout/
│   │   ├── LayoutHeader.tsx
│   │   └── LayoutFooter.tsx
│   └── index.ts
│
├── hooks/               # Custom Hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── useFetch.ts
│
├── utils/               # 공통 TS 로직
│   ├── stringUtils.ts
│   └── dateUtils.ts
│
├── types/               # 전역 타입
│   └── userTypes.ts
│
├── assets/              # 이미지 / 아이콘
│   ├── images/
│   │   └── logo.png
│   └── icons/
│
├── docs/                # ⚠️ 스토리보드/참고 자료 (수정 금지)
│   ├── storyboard/
│   └── references/
│
├── public/              # 정적 파일 (선택)
│
├── node_modules/
├── next.config.js
└── tsconfig.json
```

## 폴더별 역할

### `app/` - 라우팅 전용
- Next.js App Router의 라우팅 파일만 배치
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` 등
- **비즈니스 로직이나 컴포넌트 정의 금지**
- 컴포넌트를 import해서 조합하는 용도로만 사용

```tsx
// app/page.tsx
import { LayoutHeader } from '@/components/layout/LayoutHeader';
import { GanttChart } from '@/components/gantt/GanttChart';

export default function Page() {
  return (
    <>
      <LayoutHeader />
      <main>
        <GanttChart />
      </main>
    </>
  );
}
```

### `components/` - 공통 UI 컴포넌트
- 재사용 가능한 UI 컴포넌트
- 하위 폴더로 카테고리 분류

| 폴더 | 용도 | 예시 |
|------|------|------|
| `common/` | 범용 UI 요소 | CommonButton, CommonInput, CommonModal |
| `layout/` | 레이아웃 관련 | LayoutHeader, LayoutFooter, LayoutSidebar |
| `gantt/` | 간트차트 관련 | GanttChart, GanttRow, GanttBar |

```
components/
├── common/
│   ├── CommonButton.tsx
│   ├── CommonButton.module.css
│   ├── CommonInput.tsx
│   └── CommonInput.module.css
├── layout/
│   ├── LayoutHeader.tsx
│   └── LayoutHeader.module.css
├── gantt/
│   ├── GanttChart.tsx
│   └── GanttChart.module.css
└── index.ts
```

#### 컴포넌트 export (index.ts)
```ts
// components/index.ts
export * from './common/CommonButton';
export * from './common/CommonInput';
export * from './layout/LayoutHeader';
export * from './layout/LayoutFooter';
```

### `hooks/` - Custom Hooks
- React Custom Hook만 배치
- 파일명은 `use`로 시작

```ts
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### `utils/` - 공통 TS 로직
- 유틸리티 함수, 공통 로직 등
- React에 의존하지 않는 순수 TypeScript 코드
- **파일명은 `Utils`로 끝낸다** (예: `stringUtils.ts`, `dateUtils.ts`)
- **날짜 관련 연산/포맷은 무조건 `dayjs` 라이브러리 사용**

| 파일 | 용도 |
|------|------|
| `stringUtils.ts` | 문자열 관련 유틸리티 |
| `dateUtils.ts` | 날짜 관련 유틸리티 (dayjs 활용) |
| `apiUtils.ts` | API 관련 유틸리티 |
| `formatUtils.ts` | 포맷팅 유틸리티 |

#### dayjs 사용 규칙
- 날짜 생성, 연산, 포맷팅은 **무조건 dayjs 사용**
- 네이티브 `Date` 객체 직접 조작 금지
- 필요한 플러그인은 `dateUtils.ts`에서 한 번만 설정

```ts
// utils/dateUtils.ts
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 한국어 로케일 설정
dayjs.locale('ko');

// 날짜 포맷 상수
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const DISPLAY_FORMAT = 'YYYY년 MM월 DD일';

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
```

#### dayjs 나쁜 예 ❌
```ts
// 네이티브 Date 객체 직접 조작 금지
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);  // ❌

// 직접 문자열 파싱 금지
const dateStr = date.toISOString().split('T')[0];  // ❌
```

#### dayjs 좋은 예 ✅
```ts
import dayjs from 'dayjs';
import { formatDate, addDays } from '@/utils/dateUtils';

// dayjs 활용
const tomorrow = dayjs().add(1, 'day').toDate();  // ✅
const formatted = formatDate(new Date());          // ✅
const nextWeek = addDays(new Date(), 7);          // ✅
```

```ts
// utils/stringUtils.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
```

### `types/` - 전역 타입
- TypeScript 타입/인터페이스 정의
- 여러 곳에서 공유되는 타입만 배치
- **파일명은 `Types`로 끝낸다** (예: `userTypes.ts`, `ganttTypes.ts`)

```ts
// types/userTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
```

```ts
// types/ganttTypes.ts
export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
}
```

### `assets/` - 이미지 / 아이콘
- 프로젝트 내에서 import해서 사용하는 정적 자원
- Next.js Image 컴포넌트와 함께 사용

```
assets/
├── images/
│   ├── logo.png
│   └── background.jpg
└── icons/
    ├── arrow-left.svg
    └── arrow-right.svg
```

```tsx
// 사용 예시
import logo from '@/assets/images/logo.png';
import Image from 'next/image';

<Image src={logo} alt="Logo" width={100} height={50} />
```

### `public/` - 정적 파일
- 빌드 없이 직접 접근 가능한 파일
- favicon, robots.txt, sitemap.xml 등
- URL 경로로 직접 접근: `/logo.png`

### `docs/` - 스토리보드/참고 자료 ⚠️
- 스토리보드 참고 이미지, 기획 문서, 참고 파일 보관
- **⚠️ 사용자 수정 외에는 절대 수정/삭제 금지**
- AI 에이전트는 이 폴더의 파일을 읽기만 가능

```
docs/
├── storyboard/          # 스토리보드 이미지
│   ├── main-page.png
│   └── gantt-chart.png
└── references/          # 참고 자료
    ├── design-guide.pdf
    └── requirements.md
```

> **🚨 주의**: 이 폴더는 사용자가 직접 관리하는 참고 자료입니다.
> 코드 생성이나 리팩토링 작업 시 이 폴더의 파일을 수정하거나 삭제하지 마세요.

## Path Alias 설정

`tsconfig.json`에서 `@/` 경로 별칭을 설정하여 깔끔한 import 사용:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

```tsx
// 사용 예시
import { CommonButton } from '@/components/common/CommonButton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/dateUtils';
import type { User } from '@/types/userTypes';
```

## Import 규칙

### 기본 원칙
- **모든 import는 `@/`로 시작하는 절대 경로를 사용한다**
- 상대 경로(`./`, `../`)는 특정 예외 상황에서만 허용

### 절대 경로 사용 ✅
```tsx
// 다른 폴더의 파일 import
import { CommonButton } from '@/components/common/CommonButton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/dateUtils';
import type { Task } from '@/types/ganttTypes';
import logo from '@/assets/images/logo.png';
```

### 상대 경로 허용 예외 ⚠️

#### 1. 같은 폴더 내 module.css import
```tsx
// components/common/CommonButton.tsx
import styles from './CommonButton.module.css';  // ✅ 허용
```

#### 2. index.ts에서 같은 폴더 내 파일 export
```ts
// components/index.ts
export * from './common/CommonButton';  // ✅ 허용
export * from './layout/LayoutHeader';  // ✅ 허용
```

#### 3. 같은 폴더 내 관련 파일 import
```tsx
// components/gantt/GanttChart.tsx
import { GanttRow } from './GanttRow';      // ✅ 허용 (같은 폴더 내)
import { GanttBar } from './GanttBar';      // ✅ 허용 (같은 폴더 내)
```

### 나쁜 예 ❌
```tsx
// 다른 폴더를 상대 경로로 import하지 않는다
import { CommonButton } from '../../components/common/CommonButton';  // ❌
import { useDebounce } from '../hooks/useDebounce';                   // ❌
import { formatDate } from '../utils/dateUtils';                       // ❌
```

### Import 순서
권장하는 import 순서:
1. React/Next.js 관련
2. 외부 라이브러리
3. 컴포넌트 (`@/components/`)
4. Hooks (`@/hooks/`)
5. Utils (`@/utils/`)
6. Types (`@/types/`)
7. Assets (`@/assets/`)
8. 상대 경로 (styles, 같은 폴더 파일)

```tsx
// 예시
import { useState, useEffect } from 'react';
import Image from 'next/image';

import { CommonButton } from '@/components/common/CommonButton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/dateUtils';
import type { Task } from '@/types/ganttTypes';
import logo from '@/assets/images/logo.png';

import styles from './GanttChart.module.css';
```

## 주석 규칙

### JSDoc 주석

#### 함수/유틸리티
```ts
// utils/dateUtils.ts

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns 포맷팅된 날짜 문자열
 * @example
 * formatDate(new Date('2024-01-15')) // '2024-01-15'
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 날짜에 일수를 더한 새 Date 객체 반환
 * @param date - 기준 날짜
 * @param days - 더할 일수 (음수 가능)
 * @returns 계산된 새 Date 객체
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

#### 컴포넌트
```tsx
// components/common/CommonButton.tsx

import styles from './CommonButton.module.css';

interface CommonButtonProps {
  /** 버튼에 표시할 텍스트 */
  label: string;
  /** 버튼 클릭 시 실행할 콜백 */
  onClick: () => void;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  /** 버튼 스타일 타입 */
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * 공통 버튼 컴포넌트
 * @description 프로젝트 전반에서 사용되는 기본 버튼
 */
export function CommonButton({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}: CommonButtonProps) {
  return (
    <button
      className={styles.commonButton}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {label}
    </button>
  );
}
```

#### Custom Hook
```ts
// hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * 값의 변경을 지연시키는 디바운스 훅
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 값
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay 후에 값 업데이트
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    
    // cleanup: 컴포넌트 언마운트 또는 value 변경 시 타이머 정리
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

#### 타입/인터페이스
```ts
// types/ganttTypes.ts

/**
 * 간트차트 태스크 정보
 */
export interface Task {
  /** 태스크 고유 ID */
  id: string;
  /** 태스크 제목 */
  title: string;
  /** 시작 날짜 */
  startDate: Date;
  /** 종료 날짜 */
  endDate: Date;
  /** 진행률 (0-100) */
  progress: number;
  /** 상위 태스크 ID (없으면 최상위) */
  parentId?: string;
}

/**
 * 태스크 상태 타입
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
```

### 라인 주석

#### 복잡한 로직 설명
```ts
export function calculateTaskPosition(task: Task, config: GanttConfig) {
  // 전체 기간 대비 시작 위치 계산 (픽셀 단위)
  const startOffset = daysBetween(config.startDate, task.startDate);
  const left = startOffset * config.dayWidth;
  
  // 태스크 기간에 따른 너비 계산
  const duration = daysBetween(task.startDate, task.endDate);
  const width = duration * config.dayWidth;
  
  // 최소 너비 보장 (1일 미만 태스크도 표시되도록)
  const minWidth = config.dayWidth * 0.5;
  
  return {
    left,
    width: Math.max(width, minWidth),
  };
}
```

#### 조건문/분기 설명
```tsx
export function GanttRow({ task, level }: GanttRowProps) {
  // 중첩 레벨에 따른 들여쓰기 적용
  const indent = level * 20;
  
  // 하위 태스크 존재 여부에 따라 확장 아이콘 표시
  const hasChildren = task.children && task.children.length > 0;
  
  // 완료된 태스크는 흐리게 표시
  const isCompleted = task.progress === 100;
  
  return (
    <div 
      className={styles.ganttRow}
      style={{ paddingLeft: indent }}
      data-completed={isCompleted}
    >
      {/* 확장/축소 토글 버튼 */}
      {hasChildren && <ExpandButton taskId={task.id} />}
      
      {/* 태스크 제목 */}
      <span className={styles.ganttRowTitle}>{task.title}</span>
      
      {/* 진행률 표시 바 */}
      <ProgressBar progress={task.progress} />
    </div>
  );
}
```

#### TODO/FIXME 주석
```ts
// TODO: API 연동 후 실제 데이터로 교체 필요
const mockTasks: Task[] = [...];

// FIXME: 대용량 데이터에서 성능 이슈 발생, 가상화 적용 필요
function renderAllTasks(tasks: Task[]) { ... }

// NOTE: 이 함수는 UTC 기준으로 동작함
function parseDate(dateString: string): Date { ... }

// HACK: 라이브러리 버그 우회를 위한 임시 처리
const adjustedValue = value + 1;
```

### 주석 작성 원칙

| 원칙 | 설명 |
|------|------|
| **WHY 중심** | 코드가 "왜" 이렇게 작성되었는지 설명 |
| **간결하게** | 핵심만 명확하게 전달 |
| **최신 유지** | 코드 수정 시 주석도 함께 업데이트 |
| **한글 사용** | 한국어로 작성하여 가독성 향상 |

### 주석이 필요한 경우
- 복잡한 비즈니스 로직
- 비직관적인 코드 (성능 최적화, 버그 우회 등)
- 외부 의존성이나 제약 조건
- 공개 API (함수, 컴포넌트, 타입)

### 주석이 불필요한 경우
- 코드 자체로 의도가 명확한 경우
- 단순한 getter/setter
- 변수명이나 함수명으로 충분히 설명되는 경우

## 요약

| 폴더 | 역할 | 예시 파일 |
|------|------|-----------|
| `app/` | 라우팅 전용 | `page.tsx`, `layout.tsx` |
| `components/` | UI 컴포넌트 | `CommonButton.tsx`, `LayoutHeader.tsx` |
| `hooks/` | Custom Hooks | `useDebounce.ts`, `useFetch.ts` |
| `utils/` | 공통 TS 로직 | `dateUtils.ts`, `stringUtils.ts` |
| `types/` | 전역 타입 | `userTypes.ts`, `ganttTypes.ts` |
| `assets/` | 이미지/아이콘 | `logo.png`, `arrow.svg` |
| `docs/` | ⚠️ 참고 자료 (수정 금지) | `storyboard/`, `references/` |
| `public/` | 정적 파일 | `favicon.ico`, `robots.txt` |
