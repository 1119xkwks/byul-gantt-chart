---
name: Tailwind CSS Skill
description: Tailwind CSS 스타일링 규칙 및 가이드라인
---

# Tailwind CSS 스타일링 규칙

## 기본 원칙

1. **모든 스타일은 CSS 파일에 작성한다**
   - 컴포넌트 소스(TSX/JSX)에 Tailwind utility class를 직접 사용하지 않는다.
   - 스타일은 별도의 CSS 파일에서 관리한다.

2. **Module CSS 사용**
   - 구역별로 나눈 컴포넌트의 경우, 해당 컴포넌트 전용 module CSS 파일을 사용한다.
   - 예: `GanttChart.tsx` → `GanttChart.module.css`

3. **CSS 파일 구조**
   - CSS 파일 상단에 반드시 `@import "tailwindcss";`를 선언한다.
   - 모든 스타일은 `@apply` 지시어를 사용하여 Tailwind utility class를 적용한다.

## className 네이밍 규칙

### 충돌 방지
- UI 프레임워크(Bootstrap, MUI, Ant Design 등)의 className과 충돌하지 않도록 **프로젝트 접두사**를 사용한다.

### 나쁜 예 ❌
```css
.container { }
.card { }
.header { }
.footer { }
.button { }
.input { }
.modal { }
```

### 네이밍 컨벤션

#### 전역/공통 CSS (`globals.css` 등)
- **하이픈(-) 연결** 방식 사용
- 예: `.gantt-container`, `.gantt-card-header`

```css
/* globals.css */
@import "tailwindcss";

.gantt-container { }
.gantt-card-container { }
.gantt-header { }
.gantt-footer { }
.gantt-button { }
```

#### Module CSS (`*.module.css`)
- **카멜케이스** 방식 사용
- `styles.className` 형태로 접근 가능

```css
/* GanttCard.module.css */
.ganttContainer { }
.ganttCardContainer { }
.ganttHeader { }
.ganttFooter { }
.ganttButton { }
```

## 코드 예시

### 전역 CSS 파일 (globals.css)
```css
@import "tailwindcss";

.gantt-page-container {
  @apply min-h-screen bg-gray-50;
}

.gantt-main-header {
  @apply sticky top-0 bg-white shadow-sm;
}
```

### 전역 CSS 사용 (page.tsx)
```tsx
export default function Page() {
  return (
    <div className="gantt-page-container">
      <header className="gantt-main-header">헤더</header>
    </div>
  );
}
```

### Module CSS 파일 (GanttCard.module.css)
```css
@import "tailwindcss";

.ganttCardContainer {
  @apply flex flex-col gap-4 p-6 rounded-lg shadow-md;
}

.ganttCardHeader {
  @apply text-xl font-bold text-gray-800;
}

.ganttCardContent {
  @apply text-base text-gray-600;
}

.ganttCardFooter {
  @apply flex justify-end gap-2 mt-4;
}
```

### Module CSS 사용 (GanttCard.tsx)
```tsx
import styles from './GanttCard.module.css';

export default function GanttCard() {
  return (
    <div className={styles.ganttCardContainer}>
      <h2 className={styles.ganttCardHeader}>제목</h2>
      <p className={styles.ganttCardContent}>내용</p>
      <div className={styles.ganttCardFooter}>
        {/* 버튼 등 */}
      </div>
    </div>
  );
}
```

## 요약

| 항목 | 규칙 |
|------|------|
| 스타일 위치 | CSS 파일에만 작성 |
| CSS 타입 | 전역 CSS + Module CSS |
| Tailwind 임포트 | `@import "tailwindcss";` |
| 스타일 적용 | `@apply` 사용 |
| 전역 CSS 네이밍 | 하이픈 연결 (예: `gantt-card-container`) |
| Module CSS 네이밍 | 카멜케이스 (예: `ganttCardContainer`) |
| 직접 utility class | 컴포넌트에서 사용 금지 |

