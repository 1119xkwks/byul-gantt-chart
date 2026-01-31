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
   - **전역 CSS (globals.css)에서만** `@import "tailwindcss";`를 선언한다.
   - 전역 CSS에서는 `@apply` 지시어를 사용하여 Tailwind utility class를 적용한다.

## ⚠️ Module CSS와 Tailwind 제한사항

### 🚨 중요: Module CSS에서 Tailwind 사용 불가

**Module CSS 파일 (`*.module.css`)에서는 Tailwind를 사용할 수 없다.**

- `@import "tailwindcss";` 사용 금지
- `@apply` 지시어 사용 금지

#### 이유
CSS Modules는 "pure selectors"를 요구하는데, Tailwind의 기본 스타일에는 `*`, `[hidden]` 등 전역 셀렉터가 포함되어 있어 빌드 에러가 발생한다.

#### 에러 예시
```
Selector "*" is not pure. Pure selectors must contain at least one local class or id.
Selector "[hidden]:where(:not([hidden="until-found"]))" is not pure.
```

### Module CSS 작성 방법 ✅

Module CSS 파일에서는 **순수 CSS만 사용**한다:

```css
/* GanttCard.module.css - 순수 CSS 사용 */
.ganttCardContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ganttCardHeader {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.ganttCardContent {
  font-size: 16px;
  color: #4b5563;
}
```

### Tailwind 사용 가능한 곳 ✅

| 파일 유형 | Tailwind 사용 | 비고 |
|-----------|---------------|------|
| `globals.css` | ✅ 가능 | `@import "tailwindcss";` + `@apply` 사용 |
| `*.module.css` | ❌ 불가 | 순수 CSS만 사용 |

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
/* GanttCard.module.css - 순수 CSS */
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
/* ⚠️ @import "tailwindcss" 사용 금지! */
/* ⚠️ @apply 사용 금지! */

.ganttCardContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ganttCardHeader {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.ganttCardContent {
  font-size: 16px;
  color: #4b5563;
}

.ganttCardFooter {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
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
| Tailwind 임포트 | **전역 CSS에서만** `@import "tailwindcss";` |
| @apply 사용 | **전역 CSS에서만** 사용 가능 |
| Module CSS | **순수 CSS만** 사용 (Tailwind 사용 불가) |
| 전역 CSS 네이밍 | 하이픈 연결 (예: `gantt-card-container`) |
| Module CSS 네이밍 | 카멜케이스 (예: `ganttCardContainer`) |
| 직접 utility class | 컴포넌트에서 사용 금지 |
