# 간다GO · 강원도 지역 안내 (SootheMe)

강원특별자치도 관광 숙소·생활권별 **방문 가능 지역 안내** 정적 사이트.
데이터 기반 생성기로 `src/data.mjs`의 지역 DB에서 모든 페이지(HTML·스키마·사이트맵)를 빌드합니다.

- **상호**: 간다GO · **전화예약**: 0508-202-4719
- 디자인: Pretendard + 프리미엄 팔레트(딥 네이비 + 앰버) 토큰 시스템 (`assets/css/main.css`)

## 빌드

```bash
npm run build     # src/ → 루트에 HTML / sitemap.xml / robots.txt 생성
npm run serve     # http://localhost:8080 로컬 미리보기 (루트 기준 절대경로 CSS 사용)
```

> CSS·이미지가 루트 절대경로(`/assets/...`)라 `file://` 직접 열기로는 스타일이 적용되지 않습니다. 반드시 웹 서버(루트=저장소 루트)로 확인하세요.

## 구조

```
src/
  config.mjs    전역 설정(상호·전화·도메인·텔레그램 링크) — 배포 전 교체
  data.mjs      지역 DB: 7대 광역 생활권 / 18개 시·군 / 이용 장소 / 예약 전 확인 / 역·터미널
  zones.mjs     핵심 생활권(life zone) DB — 지점별 실제 랜드마크·성격·메모
  render.mjs    공통 레이아웃·<head>·JSON-LD 스키마·푸터·색인 판정(willIndex)
  content.mjs   지역 타입별 본문 조합기 + 시·군/권역별 고유 성격(도어웨이 방지)
  build.mjs     전체 빌드 오케스트레이션 + 근접 중복(도어웨이) 검사
assets/css/main.css   토큰 + 컴포넌트 오버레이
index.html            메인 페이지(루트에서 직접 서빙)
area/ · use/ · check/ · life/ · station/ · <시군slug>/   생성된 페이지(URL = 디렉터리 구조)
sitemap.xml, robots.txt
```

## 배포 전 반드시 교체 (`src/config.mjs`)

| 값 | 설명 |
|---|---|
| `domain` | 실제 운영 도메인 (canonical·og·sitemap에 사용) |
| `telegramWeb` | **웹사이트 제작문의** 텔레그램 핸들 |
| `telegramPartner` | **제휴문의** 텔레그램 핸들 |
| `DEFAULT_OG` | 대표 og:image / schema image 경로 |

교체 후 `npm run build` 재실행.

## SEO 설계 원칙 (구글 정책 반영)

- **E-E-A-T / Who·How·Why**: 모든 주요 페이지에 작성·검수 원칙 블록, `작성자·검수자 안내`·`개인정보`·`서비스 불가` 페이지 상시 노출.
- **얇은 콘텐츠 자동 차단**: 빌드 시 본문 노출 글자수를 측정해 **2,000자 미만 페이지는 자동 `noindex,follow`** 처리(도어웨이·양산 페이지 방지). 역·터미널 허브와 소규모 접경 군(철원·화천·양구·인제)은 의도적으로 `noindex,follow`(사용자 접근·링크 자산은 전달, 색인만 제외).
- **근접 중복(도어웨이) 검사**: 빌드 때 단독 색인 페이지의 고유 본문을 3-그램 Jaccard로 전수 비교해 유사도가 높은 페어를 경고(현재 최고 유사도 **0.53**, 지역명만 바꾼 복붙 없음). `noindex`·canonical 통합 페이지는 비교에서 제외.
- **생활권 canonical 통합**: 검색 수요가 약한 외곽 생활권(예: 원주 기업도시, 사내면)은 단독 색인 대신 **상위 시·군으로 canonical 통합**해 도어웨이를 원천 차단. `zones.mjs`의 `index` 플래그로 제어.
- **지역 고유성**: 시·군·권역·생활권마다 실제 지리·랜드마크(경포·안목, 고석정, 국토정중앙 등)를 본문 앞에 배치해 같은 타입 페이지가 복붙처럼 보이지 않도록 함.
- **구조화 데이터**: `WebSite` · `Organization` · `WebPage` · `BreadcrumbList` · `FAQPage` · `ImageObject`.
  실제 오프라인 매장이 없는 방문형 서비스이므로 **`LocalBusiness`·`Review`·`AggregateRating` 미사용**. FAQ 스키마는 본문에 실제 노출된 Q&A만 포함.
- **롱테일 내부링크**: `강원도 출장마사지` 반복 앵커 대신 `강릉 경포·안목 해안 숙소 이용 안내`처럼 이용 상황이 담긴 앵커로 지역·이용 장소·예약 확인 페이지를 상호 연결.
- **description ≤ 80자**: 전 페이지에서 강제(초과 시 빌드 경고 후 절단).
- **선호 썸네일 지정**: `og:image` + schema `ImageObject` 동시 지정.
- **금지 표현·URL 배제**: `1위 / 최저가 / VIP / 무조건 가능` 및 출구별·노선별 URL을 만들지 않음.

## 페이지 커버리지

- 메인 `/`
- 7대 광역 생활권 `/area/*`
- 18개 시·군 `/{slug}/` (1차 색인 우선 12 + 2차, 소규모 접경 4곳 noindex)
- 핵심 생활권 `/life/*` (27개 — 검색 수요 약한 곳은 상위 시·군 canonical)
- 이용 장소 `/use/*` · 예약 전 확인 `/check/*`
- 교통 거점 `/station/*` (noindex 허브)
- 운영: `author` · `contact` · `sitemap-page` · `privacy` · `service-policy`

> **도어웨이 안내**: 스펙에 있던 리조트·해안 "숙소 이용" 상세 페이지(예: `용평 리조트 숙소`, `경포 해안 숙소`)는 같은 지점을 다루는 생활권 페이지와 **중복(도어웨이)** 이 되므로 생성하지 않았습니다. 지점 콘텐츠는 생활권 페이지 하나로, 숙소 유형 가이드는 `use` 페이지 하나로 유지하고 상호 링크합니다.
