// =============================================================================
// 간다GO · 렌더 엔진 (공통 레이아웃 / 스키마 / 푸터)
// =============================================================================
import { SITE, DEFAULT_OG } from "./config.mjs";

// ---- 유틸 ----
export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// HTML 태그 제거 후 실제 노출 텍스트 추출 → 길이 측정·유사도 검사용
export const visibleText = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

export const visibleLen = (html) => visibleText(html).replace(/\s+/g, "").length;

// description 80자 제한 검증(초과 시 절단하되 로그)
export const clampDesc = (d) => {
  const s = String(d).trim();
  if (s.length <= 80) return s;
  console.warn(`⚠️  description ${s.length}자(>80) 절단: ${s}`);
  return s.slice(0, 79) + "…";
};

const abs = (path) => SITE.domain + path;

// ---- JSON-LD 스키마 ----
// Organization (모든 페이지 공통 신뢰 신호)
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: SITE.name,
    url: SITE.domain + "/",
    telephone: SITE.phone,
    areaServed: { "@type": "AdministrativeArea", name: SITE.region },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "reservations",
      areaServed: "KR",
      availableLanguage: ["Korean"],
    },
  };
}

function breadcrumbSchema(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}

function webPageSchema({ url, title, desc, image }) {
  return {
    "@type": "WebPage",
    "@id": abs(url) + "#webpage",
    url: abs(url),
    name: title,
    description: desc,
    inLanguage: "ko-KR",
    isPartOf: { "@id": abs("/#website") },
    primaryImageOfPage: { "@type": "ImageObject", url: abs(image || DEFAULT_OG) },
    publisher: { "@id": abs("/#organization") },
  };
}

function faqSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// ---- <head> ----
function head({ url, title, desc, image, noindex, canonicalUrl }) {
  const canonical = abs(canonicalUrl || url);
  const og = abs(image || DEFAULT_OG);
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex,follow">\n' : '<meta name="robots" content="index,follow,max-image-preview:large">\n'}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${og}">
<link rel="preconnect" href="https://fastly.jsdelivr.net" crossorigin>
<link rel="stylesheet" as="style" crossorigin
  href="https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>`;
}

// ---- 상단 내비 ----
function nav() {
  return `<header class="nav"><div class="wrap nav__inner">
  <a class="brand" href="/gangwon/"><span class="brand__mark">GO</span>${esc(SITE.name)}</a>
  <nav class="nav__links" aria-label="주요 메뉴">
    <a href="/gangwon/area/chuncheon-hongcheon/">춘천·원주</a>
    <a href="/gangwon/area/gangneung-donghae-samcheok/">동해안</a>
    <a href="/gangwon/area/pyeongchang-jeongseon-taebaek/">리조트·펜션</a>
    <a href="/gangwon/area/sokcho-yangyang-goseong/">속초·양양</a>
    <a href="/gangwon/area/cheorwon-hwacheon-yanggu-inje/">접경·외곽</a>
    <a href="/gangwon/check/time/">예약 전 확인</a>
    <a href="/gangwon/contact/">문의하기</a>
  </nav>
  <a class="btn btn--accent btn--sm nav__cta" href="${SITE.phoneHref}">전화예약 ${esc(SITE.phone)}</a>
</div></header>`;
}

// ---- 텔레그램 아이콘 ----
const tgIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-.9.5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.4 13.1l-4.6-1.4c-1-.3-1-1 .2-1.5l18-6.9c.8-.3 1.6.2 1.3 1z"/></svg>`;

// ---- 푸터 (제작문의 / 제휴문의 오렌지 텔레그램 버튼) ----
function footer() {
  const y = 2026;
  return `<footer class="footer"><div class="wrap">
  <div class="footer__grid">
    <div>
      <div class="footer__brand"><span class="brand__mark">GO</span>${esc(SITE.name)}</div>
      <p class="footer__desc">${esc(SITE.region)} 관광 숙소·생활권별 방문 가능 지역과 예약 전 확인사항을 안내하는 지역 안내 사이트입니다. 불법·선정적 서비스는 제공·안내하지 않습니다.</p>
      <div class="footer__phone">전화예약 ${esc(SITE.phone)}<span>상호: ${esc(SITE.name)}</span></div>
    </div>

    <div class="footer__col">
      <h4>지역 안내</h4>
      <ul>
        <li><a href="/gangwon/">강원도 홈</a></li>
        <li><a href="/gangwon/chuncheon-si/">춘천 생활권</a></li>
        <li><a href="/gangwon/gangneung-si/">강릉 해안 숙소</a></li>
        <li><a href="/gangwon/pyeongchang-gun/">평창 리조트</a></li>
        <li><a href="/gangwon/sitemap-page/">전체 지역 보기</a></li>
      </ul>
    </div>

    <div class="footer__col">
      <h4>운영 기준 · 문의</h4>
      <ul>
        <li><a href="/gangwon/check/privacy/">개인정보 처리방침</a></li>
        <li><a href="/gangwon/check/service-policy/">불법·선정적 서비스 불가</a></li>
        <li><a href="/gangwon/author/">작성자·검수자 안내</a></li>
        <li><a href="/gangwon/contact/">문의하기</a></li>
      </ul>
      <div class="footer__inquiry">
        <a class="btn--telegram" href="${SITE.telegramWeb}" target="_blank" rel="noopener nofollow" aria-label="웹사이트 제작문의 텔레그램">${tgIcon}웹사이트 제작문의</a>
        <a class="btn--telegram" href="${SITE.telegramPartner}" target="_blank" rel="noopener nofollow" aria-label="제휴문의 텔레그램">${tgIcon}제휴문의</a>
      </div>
    </div>
  </div>

  <div class="footer__bottom">
    <span>© ${y} ${esc(SITE.name)} · ${esc(SITE.region)} 지역 안내</span>
    <span>본 사이트는 방문 가능 지역·숙소 이용 기준을 안내하며, 방문 여부는 실제 주소·예약 조건 확인 후 안내됩니다.</span>
  </div>
</div></footer>`;
}

// ---- Who / How / Why 블록 ----
export function whwBlock(context = "강원도") {
  return `<section class="section--tight"><div class="wrap">
  <h2>Who · How · Why</h2>
  <div class="whw">
    <div class="whw__item"><h3>Who</h3><p>이 콘텐츠는 ${esc(context)} 방문형 웰니스 서비스 이용 전, 숙소 유형·관광 생활권·외곽 이동·예약 조건을 확인할 수 있도록 작성되었습니다. 강원특별자치도 18개 시·군과 주요 관광 숙소, KTX·터미널 거점, 리조트 생활권을 기준으로 관리합니다.</p></div>
    <div class="whw__item"><h3>How</h3><p>강원특별자치도 공식 행정구역 자료, 주요 생활권 구조, 숙소 이용 전 확인 항목, 개인정보 처리 기준, 불법·선정적 서비스 불가 원칙을 바탕으로 작성합니다. AI 보조 도구를 사용할 수 있으나 최종 문구는 사람이 검수하고 중복·과장·허위 표현을 제거합니다.</p></div>
    <div class="whw__item"><h3>Why</h3><p>이 페이지의 목적은 검색 순위 조작이 아니라, 호텔·펜션·리조트·오피스텔·KTX 인접 숙소 이용 전 필요한 확인사항을 이해하기 쉽게 안내하는 것입니다. 제공하지 않는 서비스나 불법·선정적 내용을 암시하지 않으며, 방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.</p></div>
  </div>
</div></section>`;
}

// ---- FAQ 블록 ----
export function faqBlock(faqs) {
  if (!faqs || !faqs.length) return "";
  return `<section class="section--tight"><div class="wrap">
  <h2>자주 묻는 질문</h2>
  <div class="faq">
  ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
  </div>
</div></section>`;
}

// ---- 예약 전 체크리스트 ----
export function checklistBlock() {
  const items = [
    "방문 주소를 정확히 확인했나요?",
    "호텔·펜션·리조트 중 이용 장소를 확인했나요?",
    "객실 출입 방식과 숙소 규정을 확인했나요?",
    "주차 또는 차량 진입이 가능한가요?",
    "외곽·산간 이동 기준을 확인했나요?",
    "야간 이동 가능 여부를 확인했나요?",
    "겨울철 도로 상황을 확인해야 하는 지역인가요?",
    "예약 가능 시간과 변경 기준을 확인했나요?",
    "개인정보 처리 기준을 확인했나요?",
    "불법·선정적 서비스 불가 안내를 확인했나요?",
  ];
  return `<section class="section--tight"><div class="wrap">
  <h2>예약 전 확인해야 할 내용</h2>
  <ul class="checklist">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div></section>`;
}

// ---- 관련 지역/링크 (롱테일 앵커) ----
export function relatedBlock(links, heading = "관련 지역 보기") {
  if (!links || !links.length) return "";
  return `<section class="section--tight"><div class="wrap">
  <h2>${esc(heading)}</h2>
  <div class="related">${links.map((l) => `<a href="${l.url}">${esc(l.anchor)}</a>`).join("")}</div>
</div></section>`;
}

// ---- 최종 페이지 조립 ----
// canonicalUrl: 다른 URL로 통합(consolidate)할 경우 지정. 지정 시 length 기반
//   noindex를 적용하지 않는다 — canonical과 noindex를 동시에 주면 신호가 충돌하므로,
//   얇은 변형 페이지는 canonical로만 상위 페이지에 합친다(도어웨이 방지).
// 페이지가 실제로 색인되는지 판정 (page()와 도어웨이 검사가 공유)
export function willIndex({ url, body, canonicalUrl }) {
  const consolidated = canonicalUrl && canonicalUrl !== url;
  if (consolidated) return false;
  if (url === "/gangwon/" || url.match(/\/(contact|author|sitemap-page|check|use)\b/)) return true;
  return visibleLen(body) >= 2000;
}

export function page({ url, title, desc, image, crumbs = [], faqs = [], extraSchema = [], body, canonicalUrl }) {
  desc = clampDesc(desc);
  const noindex = !willIndex({ url, body, canonicalUrl });
  // 색인 대상 상세페이지가 2000자 미만이면 noindex (스팸/얇은 페이지 방지)
  const graph = [
    { "@type": "WebSite", "@id": abs("/#website"), url: SITE.domain + "/", name: SITE.name, inLanguage: "ko-KR", publisher: { "@id": abs("/#organization") } },
    organizationSchema(),
    webPageSchema({ url: canonicalUrl || url, title, desc, image }),
  ];
  if (crumbs.length) graph.push(breadcrumbSchema(crumbs));
  const fs = faqSchema(faqs);
  if (fs) graph.push(fs);
  for (const s of extraSchema) if (s) graph.push(s);

  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 0);

  const crumbHtml = crumbs.length
    ? `<div class="wrap"><nav class="crumb" aria-label="breadcrumb">${crumbs
        .map((c, i) => (i < crumbs.length - 1 ? `<a href="${c.url}">${esc(c.name)}</a><span>›</span>` : `${esc(c.name)}`))
        .join("")}</nav></div>`
    : "";

  return `${head({ url, title, desc, image, noindex, canonicalUrl })}
${nav()}
${crumbHtml}
<main>
${body}
</main>
${footer()}
<script type="application/ld+json">${jsonld}</script>
</body>
</html>`;
}
