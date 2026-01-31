# Byul Gantt Chart

커스텀 Gantt Chart 프로젝트입니다.

## 프로젝트 소개

React 호환 Gantt Chart 라이브러리들을 검토했으나, 원하는 UI/기능을 구현하는 과정에서 커스터마이징 버그가 많아 직접 Gantt Chart를 제작하기로 결정했습니다.

### 목표
- Notion에서 제공하는 Gantt Chart와 동일한 UI/UX 구현
- 깔끔하고 직관적인 태스크 관리 인터페이스
- 부드러운 인터랙션과 애니메이션

### 기술 스택
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with @apply)
- **Date**: dayjs

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 프로젝트 구조

```
├── app/                 # 라우팅 전용
├── components/          # UI 컴포넌트
├── hooks/               # Custom Hooks
├── utils/               # 유틸리티 함수
├── types/               # TypeScript 타입
├── assets/              # 이미지/아이콘
├── docs/                # 스토리보드/참고 자료
└── public/              # 정적 파일
```

## 참고 자료

- 디자인 레퍼런스: `docs/wannabe/notion-gantt.png`
- 스토리보드: `docs/ppt/storyboard_v1.pptx`
