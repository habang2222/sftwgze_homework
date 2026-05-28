# COZY 커피 주문앱

`order.png`, `admin.png`, `coffedoce.md`를 참고해 만든 풀스택 커피 주문 앱입니다.

## 화면 구성

### 주문하기 (`/`) — order.png
- COZY 헤더, 주문하기/관리자 탭
- 메뉴 카드: 이미지, 이름, 가격, 설명, 옵션(샷 +500원, 시럽 +0원), **담기**
- 하단 **장바구니**: 담은 메뉴 목록, 총 금액, **주문하기**

### 관리자 (`/admin`) — admin.png
- **관리자 대시보드**: 총 주문 / 주문 접수 / 제조 중 / 제조 완료
- **재고 현황**: 메뉴별 재고(개), +/- 버튼
- **주문 현황**: 일시·메뉴·금액, **주문 접수** → **제조 시작** → **제조 완료** 버튼

## 기술 스택

- 프론트엔드: React, Vite, HTML, CSS
- 백엔드: Node.js, Express
- DB: PostgreSQL

## 실행 방법

### 1. PostgreSQL

```sql
CREATE DATABASE cozy_coffee;
```

### 2. 백엔드

```powershell
cd server
npm install
```

`server/.env` 생성:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:비밀번호@localhost:5432/cozy_coffee
```

```powershell
npm run db:init
npm run dev
```

### 3. 프론트엔드 (새 터미널)

```powershell
cd client
npm install
npm run dev
```

http://localhost:5173 에서 확인합니다.

## 초기 메뉴

| 메뉴 | 가격 | 재고 |
|------|------|------|
| 아메리카노(ICE) | 4,000원 | 10개 |
| 아메리카노(HOT) | 4,000원 | 10개 |
| 카페라떼 | 5,000원 | 10개 |
