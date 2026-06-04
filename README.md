# COZY 커피 주문앱

`order.png`, `admin.png`, `coffedoce.md`를 참고해 만든 풀스택 커피 주문 앱입니다.

## 화면 구성

### 주문하기 (`#/`) — order.png
- COZY 헤더, 주문하기/관리자 탭
- 메뉴 카드: 이미지, 이름, 가격, 설명, 옵션(샷 +500원, 시럽 +0원), **담기**
- 하단 **장바구니**: 담은 메뉴 목록, 총 금액, **주문하기**

### 관리자 (`#/admin`) — admin.png
- **관리자 대시보드**: 총 주문 / 주문 접수 / 제조 중 / 제조 완료
- **재고 현황**: 메뉴별 재고(개), +/- 버튼
- **주문 현황**: 일시·메뉴·금액, **주문 접수** → **제조 시작** → **제조 완료** 버튼

## 기술 스택

- 프론트엔드: React, Vite, HTML, CSS
- 백엔드: Node.js, Express
- DB: SQLite (기본) / PostgreSQL (선택)

## 빠른 실행 (Windows)

`start.bat` 더블클릭 또는:

```powershell
npm run install:all
npm run db:init
npm run build
npm run start --prefix server
```

브라우저에서 **http://localhost:3001** 을 엽니다.

### index.html로 열기

1. 위처럼 **서버를 먼저 실행**합니다 (`npm run start --prefix server`).
2. `client/dist/index.html` 파일을 더블클릭해 브라우저에서 엽니다.

> `client/index.html`(소스)은 Vite 개발용입니다. JSX 변환이 필요해서 파일 더블클릭만으로는 실행되지 않습니다.  
> 빌드된 `client/dist/index.html`을 사용하세요.

## 개발 모드 (핫 리로드)

터미널 1 — API 서버:

```powershell
cd server
npm install
npm run db:init
npm run dev
```

터미널 2 — 프론트 개발 서버:

```powershell
cd client
npm install
npm run dev
```

http://localhost:5173 에서 확인합니다.

## PostgreSQL 사용 (선택)

`server/.env`에서 DATABASE_URL을 PostgreSQL로 변경:

```env
DATABASE_URL=postgresql://postgres:비밀번호@localhost:5432/cozy_coffee
```

```powershell
cd server
npm run db:init
npm run dev
```

## 초기 메뉴

| 메뉴 | 가격 | 재고 |
|------|------|------|
| 아메리카노(ICE) | 4,000원 | 10개 |
| 아메리카노(HOT) | 4,000원 | 10개 |
| 카페라떼 | 5,000원 | 10개 |
